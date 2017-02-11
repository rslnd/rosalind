import memoize from 'lodash/memoize'
import websms from 'shebang!websmscom'

const getClient = memoize(() => {
  return new websms.Client(
    'https://api.websms.com',
    process.env.WEBSMS_USER,
    process.env.WEBSMS_PASSWORD)
})

export const send = (message) => {
  console.log('[Messages] channels/sms/websms: Sending SMS to', message.to, `"${message.text}"`, message._id)

  const { to, text } = message
  const maxSmsPerMessage = 1
  const isTest = true

  return new Promise((resolve, reject) => {
    const sms = new websms.TextMessage([to], text, (err) => {
      reject(err)
    })

    getClient().send(sms, maxSmsPerMessage, isTest, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export const receive = (payload) => {
  const from = payload.senderAddress
  const text = payload.textMessageContent

  console.log('[Messages] channels/sms/websms: Received SMS from', from, `"${text}"`)

  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 2000,
      statusMessage: 'OK, Thanks!'
    })
  })
}

export default { send, receive }
