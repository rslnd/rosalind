import some from 'lodash/some'
import http from 'http'
import https from 'https'
import { Settings } from '../../../../../settings'
import { normalizePhoneNumber } from '../../../../methods/normalizePhoneNumber'


export const name = 'fxpsms'

let isTest = false

export const send = (message) => {
  return new Promise((resolve, reject) => {
    const to = normalizePhoneNumber(message.to)
    if (!to) {
      reject(new Error(`Invalid phone number of message ${message._id}`))
    }

    if (!Settings.get('messages.sms.fxpsms.token')) {
      reject(new Error('Please set messages.sms.fxpsms.token in settings to send and receive sms with fxpsms'))
    }


    if (!Settings.get('messages.sms.fxpsms.host')) {
      reject(new Error('Please set messages.sms.fxpsms.host in settings to send and receive sms with fxpsms'))
    }

    const text = message.text

    console.log('[Messages] channels/sms/fxpsms: Sending SMS', message._id)

    if (Settings.get('messages.sms.whitelist.enabled')) {
      isTest = true
      if (Settings.get('messages.sms.whitelist.numbers') && some(Settings.get('messages.sms.whitelist.numbers').split(','), n => to.indexOf(n) !== -1)) {
        isTest = false
        console.log('[Messages] channels/sms/fxpsms: Not running in production environment, enabling test mode')
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      isTest = true
      console.log('[Messages] channels/sms/fxpsms: Not running in production environment, enabling test mode')
    }


    const body = Buffer.from(JSON.stringify({
      nonce: message._id,
      to,
      text,
      customer: process.env.CUSTOMER_PREFIX,
      test: isTest
    }), 'utf8')

    const url = Settings.get('messages.sms.fxpsms.host') + '/sms/send'

    const engine = (process.env.NODE_ENV === 'production') ? https : (url.indexOf('http://') === 0 ? http : https)
    const req = engine.request(url, {
      method: 'POST',
      headers: {
        authorization: Settings.get('messages.sms.fxpsms.token'),
        'content-type': 'application/json',
        'content-length': body.byteLength
      }
    }, (res => {
      console.log('[Messages] channels/sms/fxpsms: headers', res.statusCode, res.headers)
      let data = ''
      res.on('timeout', reject)
      res.on('error', resolve)
      res.on('data', (c) => data += c)
      res.on('end', (c) => {
        console.log('[Messages] channels/sms/fxpsms: send done', data)
        try {
          const r = JSON.parse(data)
          resolve(r)
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
}

export const receive = (payload, req) => {
  console.log('receive', payload, req, Settings.get('messages.sms.fxpsms.token'), process.env.CUSTOMER_PREFIX)

  if (!payload ||
    !payload.from ||
    !payload.text ||
    !payload.customer ||
    payload.customer !== process.env.CUSTOMER_PREFIX ||
    !req ||
    !req.headers ||
    !req.headers.authorization ||
    !Settings.get('messages.sms.fxpsms.token') ||
    req.headers.authorization !== Settings.get('messages.sms.fxpsms.token')
  ) {
    console.error('[Messages] channels/sms/fxpsms: Error: Received invalid payload or missing/wrong authorization', payload, req)
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
