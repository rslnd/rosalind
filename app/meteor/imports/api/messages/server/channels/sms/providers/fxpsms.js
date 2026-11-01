import some from 'lodash/some'
import http from 'http'
import https from 'https'
import { Settings } from '../../../../../settings'
import { normalizePhoneNumber } from '../../../../methods/normalizePhoneNumber'


export const name = 'fxpsms'

const isTestSend = async (to) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Messages] channels/sms/fxpsms: Not running in production environment, enabling test mode')
    return true
  }

  if (await Settings.get('messages.sms.whitelist.enabled')) {
    const numbers = await Settings.get('messages.sms.whitelist.numbers')
    if (numbers && some(numbers.split(','), n => to.indexOf(n) !== -1)) {
      console.log('[Messages] channels/sms/fxpsms: Whitelist enabled, recipient is whitelisted')
      return false
    }
    console.log('[Messages] channels/sms/fxpsms: Whitelist enabled, recipient is not whitelisted, enabling test mode')
    return true
  }

  return false
}

const post = ({ url, token, body }) => new Promise((resolve, reject) => {
  const engine = (process.env.NODE_ENV === 'production') ? https : (url.indexOf('http://') === 0 ? http : https)
  const req = engine.request(url, {
    method: 'POST',
    headers: {
      authorization: token,
      'content-type': 'application/json',
      'content-length': body.byteLength
    }
  }, (res => {
    console.log('[Messages] channels/sms/fxpsms: headers', res.statusCode, res.headers)
    let data = ''
    res.on('timeout', reject)
    res.on('error', reject)
    res.on('data', (c) => data += c)
    res.on('end', () => {
      console.log('[Messages] channels/sms/fxpsms: send done', data)
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        console.error('[Messages] channels/sms/fxpsms: Error: failed to parse sms send response body, resolving with { data }', data)
        resolve({ data })
      }
    })
  }))

  req.on('timeout', reject)
  req.on('error', reject)

  req.write(body)
  req.end()
})

export const send = async (message) => {
  const to = normalizePhoneNumber(message.to)
  if (!to) {
    throw new Error(`Invalid phone number of message ${message._id}`)
  }

  const token = await Settings.get('messages.sms.fxpsms.token')
  if (!token) {
    throw new Error('Please set messages.sms.fxpsms.token in settings to send and receive sms with fxpsms')
  }

  const host = await Settings.get('messages.sms.fxpsms.host')
  if (!host) {
    throw new Error('Please set messages.sms.fxpsms.host in settings to send and receive sms with fxpsms')
  }

  console.log('[Messages] channels/sms/fxpsms: Sending SMS', message._id)

  const body = Buffer.from(JSON.stringify({
    nonce: message._id,
    to,
    text: message.text,
    customer: process.env.CUSTOMER_PREFIX,
    test: await isTestSend(to)
  }), 'utf8')

  return post({ url: host + '/sms/send', token, body })
}

export const receive = async (payload, req) => {
  const token = await Settings.get('messages.sms.fxpsms.token')

  if (!payload ||
    !payload.from ||
    !payload.text ||
    !payload.customer ||
    payload.customer !== process.env.CUSTOMER_PREFIX ||
    !req ||
    !req.headers ||
    !req.headers.authorization ||
    !token ||
    req.headers.authorization !== token
  ) {
    console.error('[Messages] channels/sms/fxpsms: Error: Received invalid payload or missing/wrong authorization', payload, { hasAuthorization: !!(req && req.headers && req.headers.authorization) })
    return {
      response: {
        error: 500,
        message: 'Invalid payload'
      }
    }
  } else {
    console.log('[Messages] channels/sms/fxpsms: Received payload')
  }

  const message = {
    type: 'inbound',
    channel: 'SMS',
    direction: 'inbound',
    status: 'unread',
    to: payload.to,
    from: payload.from,
    text: payload.text,
    payload: {
      fxpsms: payload.payload
    }
  }

  const response = {
    ok: 1
  }

  return { response, message }
}

export default { send, receive, name }
