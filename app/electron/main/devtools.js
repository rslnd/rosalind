const { BrowserWindow } = require('electron')
const localShortcut = require('electron-localshortcut')
const logger = require('./logger')

const toggleDevTools = (win) => {
  win = win || BrowserWindow.getFocusedWindow()

  if (win) {
    win.toggleDevTools()
  }
}

const forceRefresh = (win) => {
  logger.info('[DevTools] User requested force refresh of browser window')
  win = win || BrowserWindow.getFocusedWindow()

  if (win) {
    win.webContents.reloadIgnoringCache()
  }
}

const start = () => {
  localShortcut.register('CmdOrCtrl+Alt+I', toggleDevTools)
  localShortcut.register('CmdOrCtrl+Shift+I', toggleDevTools)

  localShortcut.register('CmdOrCtrl+R', forceRefresh)
  localShortcut.register('F5', forceRefresh)
}

module.exports = { start }
