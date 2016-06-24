console.log('[Electron Native] Enabling native bindings')
{ ipcRenderer } = require 'electron'

try
  require 'electron-cookies'

  window.native =
    electron: process.versions.electron
    settings: null
    editSettings: -> ipcRenderer.send('settings/edit')
    log: (options) -> ipcRenderer.send('log', options)
    ipc: ipcRenderer
    users:
      currentUser: null
      onLogin: (u) -> ipcRenderer.send('users/onLogin', u)
      onLogout: (u) -> ipcRenderer.send('users/onLogout', u)
      getToken: (t) -> ipcRenderer.send('users/getToken', t)
    print: (options) -> ipcRenderer.send('window/print', options)
    import:
      terminiko: -> ipcRenderer.send('import/terminiko')
      eoswin:
        patients: -> ipcRenderer.send('import/eoswin/patients')
        reports: (options) -> ipcRenderer.send('import/eoswin/reports', options)

  require './settings'

catch e
  message = '[Electron Native] Failed to load native bindings'
  console.error(message, e)
  ipcRenderer.send 'log',
    level: 'error'
    message: message
    payload:
      name: e.name
      message: e.message
      stack: e.stack
