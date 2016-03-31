console.log('[Electron Native] Enabling native bindings')
try
  require('electron-cookies')

  ipc = require('electron').ipcRenderer

  window.native =
    electron: process.versions.electron
    settings: null
    log: (options) -> ipc.send('log', options)
    ipc: ipc
    users:
      currentUser: null
      onLogin: (u) -> ipc.send('users/onLogin', u)
      onLogout: (u) -> ipc.send('users/onLogout', u)
      getToken: (t) -> ipc.send('users/getToken', t)
    print: (options) -> ipc.send('window/print', options)
    import:
      terminiko: -> ipc.send('import/terminiko')
      eoswin:
        patients: -> ipc.send('import/eoswin/patients')
        reports: (options) -> ipc.send('import/eoswin/reports', options)

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
