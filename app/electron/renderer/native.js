console.log('[Electron Native] Enabling native bindings')
const { ipcRenderer } = require('electron')

const SENTRY_DSN_URL = 'https://6af65eb19a37410f968d4e602ce572d7@sentry.io/62218'

const { init } = require('@sentry/electron')
init({
  dsn: SENTRY_DSN_URL
})

const EventEmitter = require('eventemitter3')

// TODO Figure out how to fetch settings before loading page.
// Client key null throws nasty exceptions on server, and
// shows loading spinner indefinitely until user clicks somewhere

try {
  window.native = {
    electron: process.versions.electron,
    settings: null,
    systemInfo: null,
    editSettings: () => ipcRenderer.send('settings/edit'),
    log: options => ipcRenderer.send('log', options),
    print: options => ipcRenderer.send('window/print', options),
    events: new EventEmitter(),
    quitAndInstall: () => ipcRenderer.send('update/quitAndInstall'),
    dataTransferSuccess: a => ipcRenderer.send('import/dataTransferSuccess', a),
    emit: (name, payload) => ipcRenderer.send('webEvent', name, payload),
    load: () => {
      console.log('[Electron Native] Attempting to load native settings')
      ipcRenderer.send('window/load')
    }
  }

  ipcRenderer.on('settings', (e, settings) => {
    window.native.settings = settings
    window.native.events.emit('settings', settings)
    console.log('[Electron Native] Settings', window.native.settings)
  })

  ipcRenderer.on('version', (e, version) => {
    window.native.version = version
    window.native.events.emit('version', version)
    console.log('[Electron Native] Version', window.native.version)
  })

  ipcRenderer.on('systemInfo', (e, systemInfo) => {
    window.native.systemInfo = systemInfo
    window.native.events.emit('systemInfo', systemInfo)
    console.log('[Electron Native] systemInfo', window.native.systemInfo)
  })

  const allowedEvents = [
    'import/dataTransfer',
    'update/available'
  ]

  allowedEvents.map(name =>
    ipcRenderer.on(name, (event, args) => {
      console.log('[Electron Native] Received event', name, event, args)
      window.native.events.emit(name, args)
    })
  )
} catch (e) {
  const message = '[Electron Native] Failed to load native bindings'
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
}
