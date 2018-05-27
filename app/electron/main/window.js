const includes = require('lodash/includes')
const { app, BrowserWindow } = require('electron')
const logger = require('./logger')
const settings = require('./settings')

const open = (callback) => {
  const { screen } = require('electron')
  const display = screen.getPrimaryDisplay().workAreaSize

  const mainWindow = new BrowserWindow({
    x: display.x,
    y: display.y,
    width: display.width,
    height: display.height,
    minWidth: 560,
    minHeight: 426,
    disableAutoHideCursor: true,
    webPreferences: {
      preload: require.resolve('../renderer/native'),
      experimentalFeatures: true,
      nodeIntegration: false,
      textAreasAreResizable: false,
      experimentalCanvasFeatures: true,
      subpixelFontScaling: true,
      overlayScrollbars: false
    }
  })

  mainWindow.maximize()

  mainWindow.on('closed', () =>
    app.quit()
  )

  mainWindow.on('unresponsive', () =>
    logger.warn('[Window] Unresponsive')
  )

  const webContents = mainWindow.webContents

  if (includes(process.argv, '--dev')) {
    webContents.openDevTools()
  }
  
  let callbackCalled = false
  webContents.on('did-finish-load', () => {
    if (!callbackCalled) {
      callbackCalled = true
      callback(null)
    }
  })

  webContents.on('devtools-opened', () => {
    logger.warn('[Window] Developer Tools opened')
  })

  webContents.on('devtools-closed', () => {
    logger.warn('[Window] Developer Tools closed')
  })

  webContents.on('did-fail-load', () => {
    logger.error('[Window] Failed to load')
    callback('did-fail-load')
  })

  webContents.on('crashed', () => {
    logger.error('[Window] Crashed')
    callback('crashed')
  })

  webContents.on('plugin-crashed', () => {
    logger.error('[Window] Plugin Crashed')
    callback('plugin-crashed')
  })

  webContents.on('certificate-error', () => {
    logger.error('[Window] Certificate error')
    callback('certificate-error')
  })

  mainWindow.loadURL(settings.url)

  return mainWindow
}


module.exports = { open }
