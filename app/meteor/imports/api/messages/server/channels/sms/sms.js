import moment from 'moment-timezone'
import { rateLimit } from 'meteor/dandv:rate-limit'
import { Messages } from '../../../'
import { Calendars } from '../../../../calendars'
import { Appointments } from '../../../../appointments'
import { Patients } from '../../../../patients'
import { InboundCalls } from '../../../../inboundCalls'
import { Settings } from '../../../../settings'
import provider from './providers'
import { findParentMessage } from '../../../methods/findParentMessage'
import { isIntentToCancel } from '../../../methods/isIntentToCancel'
import { buildMessageText } from '../../../methods/buildMessageText'
import { okToSend } from '../../../methods/okToSend'
import { normalizePhoneNumber } from '../../../methods/normalizePhoneNumber'

const sendUnthrottled = (messageId) => {
  if (!Settings.get('messages.sms.enabled')) { return }

  const message = Messages.findOne({ _id: messageId })
  if (message && okToSend(message)) {
    console.log('[Messages] channels/sms: Sending SMS', message._id)
    return provider.send(message).then((res) => {
      console.log('[Messages] channels/sms: Successfully sent SMS', message._id)
      Messages.update({ _id: message._id }, {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          [`payload.${provider.name}`]: res
        }
      })
      return res
    }).catch((err) => {
      console.log('[Messages] channels/sms: Failed to send SMS', message._id, err)
      Messages.update({ _id: message._id }, {
        $set: {
          status: 'failed',
          [`payload.${provider.name}`]: err
        },
        $inc: {
          retries: 1
        }
      })
    })
  } else {
    throw new Error('[Messages] channels/sms: Could not find message to send or failed sanity checks', messageId, { okToSend: okToSend(message) })
  }
}

const sendThrottled = rateLimit(sendUnthrottled, 2000, this, {
  debug: true,
  futures: true
})

export const send = (messageId) => {
  return new Promise((resolve) => {
    const response = sendThrottled(messageId)
    Promise.await(response)
    resolve(response)
  })
}

export const receive = (payload, req) => {
  const { message, response } = provider.receive(payload, req)

  if (!message) {
    return { response }
  }

  const messageId = Messages.insert(message)

  let parentMessage
  let appointmentId
  let appointment
  let calendarId
  let calendar
  let patientId
  let patient
  let cancelAppointment

  console.log('[Messages] channels/sms: Received message', messageId)

  // Try to match received reply with a message sent by the system
  const cutoffDate = moment().subtract(1, 'week').toDate()
  const sentMessages = Messages.find(
    {
      channel: 'SMS',
      direction: 'outbound',
      status: 'sent',
      sentAt: { $gt: cutoffDate }
    }, {
      sort: {
        sentAt: -1
      }
    }
  ).fetch()

  parentMessage = findParentMessage({ messages: sentMessages, message })
  if (parentMessage) {
    console.log('[Messages] channels/sms: Matched message', messageId, 'as reply to', parentMessage._id)

    appointmentId = parentMessage.appointmentId
    appointment = Appointments.findOne({ _id: appointmentId })

    if (appointment) {
      calendarId = appointment.calendarId
      calendar = calendarId && Calendars.findOne({ _id: calendarId })
      patientId = parentMessage.patientId
      patient = Patients.findOne({ _id: patientId })

      Messages.update({ _id: messageId }, {
        $set: {
          parentMessageId: parentMessage._id,
          appointmentId: appointmentId,
          calendarId: calendarId,
          patientId: patientId
        }
      })

      cancelAppointment = isIntentToCancel(message.text)
      const canCancel = moment().add(5, 'minutes').isBefore(appointment.start)
      if (cancelAppointment && !canCancel) {
        console.log('[Messages] channels/sms: Matched message', messageId, 'as intent to cancel appointment', appointmentId, 'but was recevied too close to appointment start, ignoring')
      }
      if (cancelAppointment && canCancel) {
        console.log('[Messages] channels/sms: Matched message', messageId, 'as intent to cancel appointment', appointmentId)
        Appointments.actions.setCanceled.call({ appointmentId, canceledByMessageId: messageId })

        Messages.update({ _id: messageId }, {
          $set: {
            type: 'intentToCancel',
            status: 'answered'
          }
        })

        const cancelationConfirmationText =
          (calendar && calendar.smsAppointmentReminderCancelationConfirmationText) ||
          Settings.get('messages.sms.appointmentReminder.cancelationConfirmationText')

        if (cancelationConfirmationText) {
          const confirmationId = Messages.insert({
            type: 'intentToCancelConfirmation',
            channel: 'SMS',
            direction: 'outbound',
            text: buildMessageText({
              text: cancelationConfirmationText
            }, {
                date: appointment.start
              }),
            to: message.from,
            status: 'final',
            invalidBefore: new Date(),
            invalidAfter: moment().add(15, 'minutes').toDate(),
            parentMessageId: messageId,
            payload: {
              appointmentId,
              patientId
            }
          })

          console.log('[Messages] channels/sms: Sending cancelation confirmation', confirmationId, 'for received message', messageId)
          send(confirmationId)
        }

        return { message, response }
      }
    } else {
      console.log('[Messages] channels/sms: Could not match received message', messageId, 'to any parent message')
    }
  }

  if (!patientId) {
    patient = Patients.findOne({ 'contacts.valueNormalized': normalizePhoneNumber(message.from) })
    if (patient) {
      patientId = patient._id

      Messages.update({ _id: messageId }, {
        $set: {
          patientId: patientId
        }
      })
    }
  }

  // If we couldn't match this incoming message to a message we sent,
  // or if it is not an intent to cancel, create an inbound call
  if (Settings.get('messages.sms.createInboundCalls')) {
    const inboundCallId = InboundCalls.insert({
      lastName: (patient && patient.lastName) || 'SMS',
      firstName: (patient && patient.firstName) || undefined,
      telephone: message.from,
      note: message.text,
      patientId: patient ? patientId : undefined,
      payload: {
        channel: 'SMS',
        messageId,
        appointmentId,
        patientId
      },
      createdAt: new Date()
    })
    console.log('[Messages] channels/sms: Created inbound call', inboundCallId, 'of received message', messageId)
  } else {
    console.log('[Messages] channels/sms: Ignoring incoming message', messageId)
  }

  return { message, response }
}
