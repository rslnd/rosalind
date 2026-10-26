import memoize from 'lodash/memoize'
import some from 'lodash/some'
import websms from 'websmscom'
import { Settings } from '../../../../../settings'
import { normalizePhoneNumber } from '../../../../methods/normalizePhoneNumber'

export const name = 'websms'

let isTest = false

const getClient = memoize(async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
    isTest = true
  }

  return new websms.Client(
    'https://api.websms.com',
    await Settings.get('messages.sms.websms.username'),
    await Settings.get('messages.sms.websms.password'))
})

export const send = (message) => {
  return new Promise(async (resolve, reject) => {
    const to = normalizePhoneNumber(message.to)
    if (!to) {
      reject(new Error(`Invalid phone number of message ${message._id}`))
    }

    const text = message.text

    console.log('[Messages] channels/sms/websms: Sending SMS', message._id)

    const maxSmsPerMessage = 1

    if (await Settings.get('messages.sms.whitelist.enabled')) {
      isTest = true
      if (await Settings.get('messages.sms.whitelist.numbers') && some((await Settings.get('messages.sms.whitelist.numbers')).split(','), n => to.indexOf(n) !== -1)) {
        isTest = false
        console.log('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      isTest = true
      console.log('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
    }

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

export const receive = (payload) => {
  if (!payload || !payload.recipientAddress || !payload.textMessageContent) {
    console.error('[Messages] channels/sms/websms: Received invalid payload', payload)
    return {
      response: {
        statusCode: 500,
        statusMessage: 'Invalid payload'
      }
    }
  } else {
    console.log('[Messages] channels/sms/websms: Received payload')
  }

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
