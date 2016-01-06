console.log('[Electron Native] Enabling native bindings')

require('electron-cookies')

window.electron = process.versions.electron
window.ipc = require('electron').ipcRenderer
