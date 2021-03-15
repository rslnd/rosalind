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
  // Don't register F5 etc because they interfere with cgm ultrasonic
  localShortcut.register('CmdOrCtrl+Alt+I', toggleDevTools)
  localShortcut.register('CmdOrCtrl+Shift+I', toggleDevTools)
  localShortcut.register('CmdOrCtrl+R', forceRefresh)
}

module.exports = { start }
