import { Messages } from 'api/messages'
import provider from './providers'

export const send = (message) => {
  console.log('[Messages] channels/sms: sending message', message)
  return provider.send(message).then((res) => {
    console.log('[Messages] channels/sms: successfully sent SMS to', message.to, `"${message.text}"`, message._id)
    Messages.update({ _id: message._id }, { $set: { status: 'sent' } })
  }).catch((e) => {
    console.log('[Messages] channels/sms: Failed to send SMS to', message.to, `"${message.text}"`, message._id)
    Messages.update({ _id: message._id }, { $set: { status: 'failed' }, $inc: { retries: 1 } })
  })
}

export const receive = (payload) => {
  console.log('[Messages] channels/sms: receiving payload', payload)

  return provider.receive(payload)
}
