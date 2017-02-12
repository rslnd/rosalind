import { Messages } from 'api/messages'
import { Appointments } from 'api/appointments'
import provider from './providers'
import { findParentMessage } from 'api/messages/methods/findParentMessage'
import { isIntentToCancel } from 'api/messages/methods/isIntentToCancel'

export const send = (message) => {
  console.log('[Messages] channels/sms: sending message', message)
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

    Messages.update({ _id: messageId }, {
      $set: {
        parentMessageId: parentMessage._id,
        'payload.appointmentId': appointmentId,
        'payload.patientId': parentMessage.payload.patientId
      }
    })

    const cancelAppointment = isIntentToCancel(message.text)
    if (cancelAppointment) {
      console.log('[Messages] channels/sms: Matched message', messageId, 'as intent to cancel appointment', appointmentId)
      Appointments.actions.setCanceled.call({ appointmentId })

      Messages.update({ _id: messageId }, {
        $set: {
          type: 'intentToCancel',
          status: 'answered'
        }
      })

      // TODO: Reply with confirmation of cancelation
      // console.log('[Messages] channels/sms: Sending cancelation confirmation')
    }
  }

  return { message, response }
}
