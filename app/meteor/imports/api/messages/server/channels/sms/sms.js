import moment from 'moment-timezone'
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

const sendUnthrottled = async (messageId) => {
  if (!await Settings.get('messages.sms.enabled')) { return }

  const message = await Messages.findOneAsync({ _id: messageId })
  if (message && okToSend(message)) {
    console.log('[Messages] channels/sms: Sending SMS', message._id)
    return provider.send(message).then(async (res) => {
      console.log('[Messages] channels/sms: Successfully sent SMS', message._id)
      await Messages.updateAsync({ _id: message._id }, {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          [`payload.${provider.name}`]: res
        }
      })
      return res
    }).catch(async (err) => {
      console.log('[Messages] channels/sms: Failed to send SMS', message._id, err)
      await Messages.updateAsync({ _id: message._id }, {
        $set: {
          status: 'failed',
          failedAt: new Date(),
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

// Serialize SMS sends, spacing each call at least `intervalMs` apart to respect
// the provider's rate limit. Replaces the Fibers-based dandv:rate-limit package.
const rateLimitAsync = (fn, intervalMs) => {
  let chain = Promise.resolve()
  let last = 0
  return (...args) => {
    const run = chain.then(async () => {
      const wait = Math.max(0, last + intervalMs - Date.now())
      if (wait > 0) { await new Promise(resolve => setTimeout(resolve, wait)) }
      last = Date.now()
      return fn(...args)
    })
    chain = run.catch(() => {})
    return run
  }
}

const sendThrottled = rateLimitAsync(sendUnthrottled, 2000)

export const send = async (messageId) => {
  const response = sendThrottled(messageId)
  await response
  return response
}

export const receive = async (payload, req) => {
  const { message, response } = await provider.receive(payload, req)

  if (!message) {
    return { response }
  }

  const messageId = await Messages.insertAsync(message)

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
  const sentMessages = await Messages.find(
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
  ).fetchAsync()

  parentMessage = findParentMessage({ messages: sentMessages, message })
  if (parentMessage) {
    console.log('[Messages] channels/sms: Matched message', messageId, 'as reply to', parentMessage._id)

    appointmentId = parentMessage.appointmentId
    appointment = await Appointments.findOneAsync({ _id: appointmentId })

    if (appointment) {
      calendarId = appointment.calendarId
      calendar = calendarId && await Calendars.findOneAsync({ _id: calendarId })
      patientId = parentMessage.patientId
      patient = await Patients.findOneAsync({ _id: patientId })

      await Messages.updateAsync({ _id: messageId }, {
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
        await Appointments.actions.setCanceled.callPromise({ appointmentId, canceledByMessageId: messageId })

        await Messages.updateAsync({ _id: messageId }, {
          $set: {
            type: 'intentToCancel',
            status: 'answered'
          }
        })

        const cancelationConfirmationText =
          (calendar && calendar.smsAppointmentReminderCancelationConfirmationText) ||
          await Settings.get('messages.sms.appointmentReminder.cancelationConfirmationText')

        if (cancelationConfirmationText) {
          const confirmationId = await Messages.insertAsync({
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
          await send(confirmationId)
        }

        return { message, response }
      }
    } else {
      console.log('[Messages] channels/sms: Could not match received message', messageId, 'to any parent message')
    }
  }

  if (!patientId) {
    patient = await Patients.findOneAsync({ 'contacts.valueNormalized': normalizePhoneNumber(message.from) })
    if (patient) {
      patientId = patient._id

      await Messages.updateAsync({ _id: messageId }, {
        $set: {
          patientId: patientId
        }
      })
    }
  }

  // If we couldn't match this incoming message to a message we sent,
  // or if it is not an intent to cancel, create an inbound call
  if (await Settings.get('messages.sms.createInboundCalls')) {
    const inboundCallId = await InboundCalls.insertAsync({
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
