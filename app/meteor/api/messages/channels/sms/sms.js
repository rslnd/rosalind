import moment from 'moment'
import { Messages } from 'api/messages'
import { Appointments } from 'api/appointments'
import { InboundCalls } from 'api/inboundCalls'
import provider from './providers'
import { findParentMessage } from 'api/messages/methods/findParentMessage'
import { isIntentToCancel } from 'api/messages/methods/isIntentToCancel'

export const send = (messageId) => {
  const message = Messages.findOne({ _id: messageId })
  if (message) {
    console.log('[Messages] channels/sms: Sending message', message)
    return provider.send(message).then((res) => {
      console.log('[Messages] channels/sms: Successfully sent SMS', message._id, res)
      Messages.update({ _id: message._id }, {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          [`payload.${provider.name}`]: res
        }
      })
    }).catch((err) => {
      console.log('[Messages] channels/sms: Failed to send SMS', message._id, err)
      Messages.update({ _id: message._id }, {
        $set: {
          status: 'failed',
          [`payload.${provider.name}`]: err
        },
        $inc: {
          retries: 1
        } })
    })
  } else {
    throw new Error('[Messages] channels/sms: Could not find message to send', messageId)
  }
}

export const receive = (payload) => {
  const { message, response } = provider.receive(payload)
  const messageId = Messages.insert(message)

  console.log('[Messages] channels/sms: Received message', messageId, message)

  // Try to match received reply with a message sent by the system
  const sentMessages = Messages.find(
    {
      channel: 'SMS',
      direction: 'outbound',
      status: 'sent',
      removed: { $ne: true }
    }, {
      sort: {
        sentAt: -1
      }
    }
  ).fetch()

  const parentMessage = findParentMessage({ messages: sentMessages, message })
  if (parentMessage) {
    console.log('[Messages] channels/sms: Matched message', messageId, 'as reply to', parentMessage._id)

    const appointmentId = parentMessage.payload.appointmentId
    const patientId = parentMessage.payload.patientId

    Messages.update({ _id: messageId }, {
      $set: {
        parentMessageId: parentMessage._id,
        'payload.appointmentId': appointmentId,
        'payload.patientId': patientId
      }
    })

    const cancelAppointment = isIntentToCancel(message.text)
    if (appointmentId && cancelAppointment) {
      console.log('[Messages] channels/sms: Matched message', messageId, 'as intent to cancel appointment', appointmentId)
      Appointments.actions.setCanceled.call({ appointmentId })

      Messages.update({ _id: messageId }, {
        $set: {
          type: 'intentToCancel',
          status: 'answered'
        }
      })

      if (process.env.SMS_REMINDER_CANCELATION_CONFIRMATION_TEXT) {
        const confirmationId = Messages.insert({
          type: 'intentToCancelConfirmation',
          channel: 'SMS',
          direction: 'outbound',
          text: process.env.SMS_REMINDER_CANCELATION_CONFIRMATION_TEXT,
          to: message.from,
          status: 'scheduled',
          scheduled: new Date(),
          invalidBefore: new Date(),
          invalidAfter: moment().add(15, 'minutes').toDate(),
          parentMessageId: messageId,
          payload: {
            appointmentId,
            patientId
          }
        })
        console.log('[Messages] channels/sms: Scheduled cancelation confirmation', confirmationId, 'for received message', messageId)
      }

      return { message, response }
    }
  } else {
    console.log('[Messages] channels/sms: Could not match received message', messageId, 'to any parent message')
  }

  // If we couldn't match this incoming message to a message we sent,
  // or if it is not an intent to cancel, create an inbound call
  const inboundCallId = InboundCalls.methods.post.call({
    lastName: 'SMS',
    telephone: message.from,
    note: message.text,
    payload: {
      messageId
    }
  })
  console.log('[Messages] channels/sms: Created inbound call', inboundCallId, 'of received message', messageId)

  return { message, response }
}
