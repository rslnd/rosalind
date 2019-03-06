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

export const handleElectronEvents = ({ events }) => {
  window.addEventListener('message', listener(events), false)
  console.log('[Native] Electron: handling events')
  return { postToNative }
}

const debug = msg => DEBUG && console.log(`[Debug] ${msg}`)

const listener = events => messageEvent => {
  debug(`Received message ${messageEvent.origin}`)

  if (messageEvent.source !== window) {
    debug('Discarding event because sources do not match')
    return
  }

  if (!isValidOrigin(messageEvent.origin)) {
    debug('Discarding event because origin is invalid')
    return
  }

  if (typeof messageEvent.data !== 'string') {
    debug(`Discarding event because data is not a string: ${JSON.stringify(messageEvent.data)}`)
    return
  }

  if (messageEvent.data.indexOf(eventPrefix) !== 0) {
    debug(`Discarding event because prefix is missing: ${messageEvent.data}`)
    return
  }

  const parsed = JSON.parse(messageEvent.data.slice(eventPrefix.length))

  if (!((Object.keys(parsed).length === 2) && parsed.name && parsed.payload)) {
    throw new Error(`Invalid shape of event data: ${Object.keys(parsed).join(',')}`)
  }

  if (toWeb.indexOf(parsed.name) === -1) {
    debug(`Discarding event because name is not whitelisted in toWeb: ${parsed.name}`)
    return
  }

  console.log(`[Native] Emitting ${parsed.name}`)
  events.emit(parsed.name, parsed.payload)
}

const postToNative = (name, payload) => {
  const eventString = [
    eventPrefix,
    JSON.stringify({ name, payload })
  ].join('')

  const targetOrigin = window.location.origin
  window.postMessage(eventString, targetOrigin)
}

const isValidOrigin = url => {
  if (!url) { return false }
  if (url.match(/^https:\/\/.*\.rslnd\.com$/)) { return true }
  if (process.env.NODE_ENV === 'development' && url.match(/^http:\/\/localhost:3000$/)) { return true }
  return false
}
