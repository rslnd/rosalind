import memoize from 'lodash/memoize'
import some from 'lodash/some'
import websms from 'websmscom'
import { Settings } from '../../../../../settings'
import { normalizePhoneNumber } from '../../../../methods/normalizePhoneNumber'

export const name = 'websms'

const getClient = memoize(async () =>
  new websms.Client(
    'https://api.websms.com',
    await Settings.get('messages.sms.websms.username'),
    await Settings.get('messages.sms.websms.password')))

const isTestSend = async (to) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Messages] channels/sms/websms: Not running in production environment, enabling test mode')
    return true
  }

  if (await Settings.get('messages.sms.whitelist.enabled')) {
    const numbers = await Settings.get('messages.sms.whitelist.numbers')
    if (numbers && some(numbers.split(','), n => to.indexOf(n) !== -1)) {
      console.log('[Messages] channels/sms/websms: Whitelist enabled, recipient is whitelisted')
      return false
    }
    console.log('[Messages] channels/sms/websms: Whitelist enabled, recipient is not whitelisted, enabling test mode')
    return true
  }

  return false
}

export const send = async (message) => {
  const to = normalizePhoneNumber(message.to)
  if (!to) {
    throw new Error(`Invalid phone number of message ${message._id}`)
  }

  console.log('[Messages] channels/sms/websms: Sending SMS', message._id)

  const maxSmsPerMessage = 1
  const isTest = await isTestSend(to)

  let client
  try {
    client = await getClient()
  } catch (e) {
    // Don't cache a failed client creation forever
    getClient.cache.clear()
    throw e
  }

  return new Promise((resolve, reject) => {
    const sms = new websms.TextMessage([to], message.text, (err) => {
      reject(err)
    })

    client.send(sms, maxSmsPerMessage, isTest, (err, res) => {
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
