import { Messages } from 'api/messages'
import provider from './providers'

export const SMS = {
  send (message) {
    console.log(message)
    provider.send(message).then((res) => {
      console.log('SMS to', message.to, 'sent successfully')
      Messages.update({ _id: message._id }, { $set: { status: 'sent' } })
    }).catch((e) => {
      console.log('SMS to ', message.to, 'failed with error', e)
      Messages.update({ _id: message._id }, { $set: { status: 'failed' }, $inc: { retries: 1 } })
    })
  }
}
