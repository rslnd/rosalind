console.log('[Electron Native] Enabling native bindings')
try
  require('electron-cookies')

  ipc = require('electron').ipcRenderer

  window.native =
    electron: process.versions.electron
    settings: null
    ipc: ipc
    ipcStream: require('electron-ipc-stream')
    authentication:
      currentUser: null
      onLogin: (u) -> ipc.send('authentication/onLogin', u)
      onLogout: (u) -> ipc.send('authentication/onLogout', u)
  require('./settings')

catch e
  message = '[Electron Native] Failed to load native bindings'
  console.error(message, e)
  require('electron').ipcRenderer.send 'log',
    level: 'error'
    message: message
    payload:
      name: e.name
      message: e.message
      stack: e.stack
