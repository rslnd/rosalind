ipc = require('electron').ipcRenderer

ipc.on 'settings', (e, settings) ->
  window.native.settings = settings
  console.log('[Electron Native] Settings', window.native.settings)

ipc.send('settings')
