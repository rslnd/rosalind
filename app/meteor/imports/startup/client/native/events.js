import EventEmitter from 'eventemitter3'
import { attemptRegistration } from './attemptRegistration'

// Whitelist receivable events here
// Keep in sync with electron/renderer/preload.js
const toWeb = [
  'clientKey',
  'systemInfo',
  'fileAdded',
  'updateAvailable',
  'dataTransfer'
]

const DEBUG = true

const eventPrefix = 'rslndNative*'
const events = new EventEmitter()

// This is set when the native interface is ready
let clientKey = null
let systemInfo = null
let settings = null

export default () => {
  window.addEventListener('message', listener, false)

  toNative('hello')

  // If we get a clientKey event, we know we're running on a native platform
  onNativeEvent('welcome', async payload => {
    console.log('[Native] Got client key')
    const registration = await attemptRegistration({ systemInfo, clientKey })
    if (registration.isOk) {
      // Make it official
      clientKey = payload.clientKey
      systemInfo = payload.systemInfo
      settings = registration.settings

      events.emit('settings', settings)
    }
  })

  window.toNative = toNative
  window.onNativeEvent = onNativeEvent
}

export const onNativeEvent = (event, callback) => {
  events.on(event, callback)
}

export const toNative = (name, payload = {}) => {
  console.log('[Native] Posting message', name)

  if (window.isAndroid) {
    console.error('[Native] Android interface not implemented')
  } else {
    postMessageToNative({ name, payload })
  }
}

export const getClientKey = () => clientKey

const debug = msg => DEBUG && console.log(`[Debug] ${msg}`)

const listener = messageEvent => {
  debug(`Received message ${messageEvent.origin}`)

  if (messageEvent.source !== window) {
    debug('Discarding event becuase sources do not match')
    return
  }

  if (!isValidOrigin(messageEvent.origin)) {
    debug('Discarding event becuase origin is invalid')
    return
  }

  if (typeof messageEvent.data !== 'string') {
    debug('Discarding event because data is not a string')
    return
  }

  if (messageEvent.data.indexOf(eventPrefix) !== 0) {
    debug('Discarding event because prefix is missing')
    return
  }

  const parsed = JSON.parse(messageEvent.data.slice(eventPrefix.length))

  if (!((Object.keys(parsed).length === 2) && parsed.name && parsed.payload)) {
    throw new Error(`Invalid shape of event data: ${Object.keys(parsed).join(',')}`)
  }

  if (toWeb.indexOf(parsed.name) === -1) {
    debug('Discarding event because name is not whitelisted in toWeb')
    return
  }

  console.log(`[Native] Emitting ${parsed.name}`)
  events.emit(parsed.name, parsed.payload)
}

const postMessageToNative = ({ name, payload }) => {
  const eventString = [
    eventPrefix,
    JSON.stringify({ name, payload })
  ].join('')

  const targetOrigin = window.location.origin
  window.postMessage(eventString, targetOrigin)
}

const isValidOrigin = url => {
  if (!url) { return false }
  if (url.match(/^https:\/\/*.\.rslnd\.com$/)) { return true }
  if (process.env.NODE_ENV === 'development' && url.match(/^http:\/\/localhost:3000$/)) { return true }
  return false
}
