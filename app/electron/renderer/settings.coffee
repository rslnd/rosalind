{ ipcRenderer } = require 'electron'

ipcRenderer.on 'settings', (e, settings) ->
  window.native.settings = settings
  console.log('[Electron Native] Settings', window.native.settings)

ipcRenderer.send('settings')
