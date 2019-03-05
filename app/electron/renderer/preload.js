console.log('[Electron Native] Enabling native bindings')

// Whitelist events to native: ipc <- web
const toNative = [
  'hello',
  'print',
  'quitAndInstall',
  'automation/generateEoswinReports',
  'dataTransferSuccess'
]

// Whitelist events to web: ipc -> web
const toWeb = [
  'welcome',
  'fileAdded',
  'updateAvailable',
  'dataTransfer'
]

const DEBUG = true
const eventPrefix = 'rslndNative*'
const targetOrigin = DEBUG ? '*' : 'https://*.rslnd.com'

window.ELECTRON_ENABLE_SECURITY_WARNINGS = true

const { ipcRenderer } = require('electron')
const { init } = require('@sentry/electron')

const SENTRY_DSN_URL = 'https://6af65eb19a37410f968d4e602ce572d7@sentry.io/62218'
init({ dsn: SENTRY_DSN_URL })

const logger = {
  error: (message, e) => {
    console.error(message, e)
    ipcRenderer.send('log', {
      level: 'error',
      message: message,
      payload: {
        name: e.name,
        message: e.message,
        stack: e.stack
      }
    })
  },
  info: message => {
    console.log(message)
    ipcRenderer.send('log', {
      level: 'info',
      message: 'message'
    })
  }
}

// IMPORTANT: Keep in sync with preload.js
const isUrlValid = urlString => {
  if (DEBUG) { return true }

  try {
    const url = new URL(urlString)
    const isValid = !!(url.origin.match(/^https:\/\/.*\.rslnd\.com$/))
    if (!isValid) {
      logger.error(`[Window] isUrlValid failed check: ${urlString}`)
      return false
    } else {
      return true
    }
  } catch (e) {
    logger.error(`[Window] isUrlValid failed parse: ${urlString}`, e)
    return false
  }
}

try {
  // Set up toNative: ipc <- web

  // Can't just log/stringify the message object as it would just print { isTrusted: true }
  // Always need to read .data and .origin directly.
  const listener = (messageEvent) => {
    // console.log(`preload: ${JSON.stringify(message)} (${JSON.stringify(message.data)}) [(${JSON.stringify(message.origin)})] {${message.source === window}}`)
    try {
      if (messageEvent.source !== window) {
        return
      }

      if (!isUrlValid(messageEvent.origin)) {
        throw new Error('Invalid origin')
      }

      if (typeof messageEvent.data !== 'string') {
        return
      }

      if (messageEvent.data.indexOf(eventPrefix) !== 0) {
        return
      }

      logger.info(`[Preload] Message ${JSON.stringify(messageEvent.data)}`)

      const json = messageEvent.data.slice(eventPrefix.length)

      const parsed = JSON.parse(json)

      if (!((Object.keys(parsed).length === 2) && parsed.name && parsed.payload)) {
        throw new Error(`Invalid shape of event data: ${Object.keys(parsed).join(',')}`)
      }

      if (toNative.indexOf(parsed.name) === -1) {
        return
      }

      logger.info(`[Preload] sending to ipc: ${parsed.name}`)

      ipcRenderer.send(parsed.name, parsed.payload)
    } catch (e) {
      logger.error('[Preload] Discarding message', e)
    }
  }

  window.addEventListener('message', listener, false)

  // Set up toWeb: ipc -> web
  toWeb.map(name => {
    ipcRenderer.on(name, (ipcEvent, payload = {}) => {
      const event = { name, payload }
      try {
        const eventString = [
          eventPrefix,
          JSON.stringify(event)
        ].join('')
        logger.info(`[Preload] Posting event ${name} ${eventString}`)
        window.postMessage(eventString, targetOrigin)
      } catch (e) {
        logger.error(`[Preload] Failed to serialize event ${name}`, e)
      }
    })
  })
} catch (e) {
  logger.error('[Preload] Failed to initialize', e)
}
