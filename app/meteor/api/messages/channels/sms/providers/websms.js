import memoize from 'lodash/memoize'
import some from 'lodash/some'
import websms from 'shebang!websmscom'
import Bottleneck from 'bottleneck'
import { Settings } from 'api/settings'
import { normalizePhoneNumber } from 'api/messages/methods/normalizePhoneNumber'

export const name = 'websms'

const limiter = new Bottleneck(1, 10 * 1000)

let isTest = false

const getClient = memoize(() => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
    isTest = true
  }

  return new websms.Client(
    'https://api.websms.com',
    Settings.get('messages.sms.websms.username'),
    Settings.get('messages.sms.websms.password'))
})

export const sendUnthrottled = (message) => {
  const to = normalizePhoneNumber(message.to)
  const text = message.text

  console.log('[Messages] channels/sms/websms: Sending SMS to', to, `"${text}"`, message._id)

  const maxSmsPerMessage = 1

  if (Settings.get('messages.sms.whitelist.enabled')) {
    isTest = true
    if (Settings.get('messages.sms.whitelist.numbers') && some(Settings.get('messages.sms.whitelist.numbers').split(','), n => to.indexOf(n) !== -1)) {
      isTest = false
      console.log('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    isTest = true
    console.log('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
  }

  return new Promise((resolve, reject) => {
    const sms = new websms.TextMessage([to], text, (err) => {
      reject(err)
    })

    getClient().send(sms, maxSmsPerMessage, isTest, (err, res) => {
      if (err) {
        reject(err)
      } else {
        delete res.messageObject
        resolve(res)
      }
    })
  })
}

export const send = (message) => {
  return limiter.schedule(sendUnthrottled, message)
}

export const receive = (payload) => {
  console.log('[Messages] channels/sms/websms: Received payload', payload)

  const message = {
    type: 'inbound',
    channel: 'SMS',
    direction: 'inbound',
    status: 'unread',
    to: payload.recipientAddress,
    from: payload.senderAddress,
    text: payload.textMessageContent,
    payload: {
      websms: payload
    }
  }

  const response = {
    statusCode: 2000,
    statusMessage: 'OK, Thanks!'
  }

  return { response, message }
}

export default { send, receive, name }
