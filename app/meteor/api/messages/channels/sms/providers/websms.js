import memoize from 'lodash/memoize'
import some from 'lodash/some'
import websms from 'shebang!websmscom'
import { normalizePhoneNumber } from 'api/messages/methods/normalizePhoneNumber'

export const name = 'websms'

const getClient = memoize(() => {
  return new websms.Client(
    'https://api.websms.com',
    process.env.WEBSMS_USER,
    process.env.WEBSMS_PASSWORD)
})

export const send = (message) => {
  const to = normalizePhoneNumber(message.to)
  const text = message.text

  console.log('[Messages] channels/sms/websms: Sending SMS to', to, `"${text}"`, message._id)

  const maxSmsPerMessage = 1

  let isTest = true

  // FIXME: Remove whitelisting before going into production
  if (process.env.SMS_WHITELIST && some(process.env.SMS_WHITELIST.split(','), n => to.indexOf(n) !== -1)) {
    isTest = false
    console.log('DEBUG: Disabling SMS test mode for', to)
  } else {
    console.log('DEBUG: Test mode is enabled, not actually sending SMS message')
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

export default { send, receive }
