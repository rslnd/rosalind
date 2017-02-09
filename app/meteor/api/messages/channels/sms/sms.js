import { Messages } from 'api/messages'
import provider from './providers'

export const SMS = {
  send (message) {
    console.log(message)
    provider.send(message).then((res) => {
      console.log('[Messages] channels/sms: successfully sent SMS to', message.to, `"${message.text}"`, message._id)
      Messages.update({ _id: message._id }, { $set: { status: 'sent' } })
    }).catch((e) => {
      console.log('[Messages] channels/sms: Failed to send SMS to', message.to, `"${message.text}"`, message._id)
      Messages.update({ _id: message._id }, { $set: { status: 'failed' }, $inc: { retries: 1 } })
    })
  }
}
