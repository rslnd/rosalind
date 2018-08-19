const includes = require('lodash/includes')
const { app, BrowserWindow } = require('electron')
const logger = require('./logger')
const settings = require('./settings')
const { captureException } = require('@sentry/electron')

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
    backgroundColor: '#ecf0f5',
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

  webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedUrl, isMainFrame) => {
    const message = logger.error('[Window] Failed to load', { event, errorCode, errorDescription, validatedUrl, isMainFrame })
    captureException(new Error(message))
    callback('did-fail-load')
  })

  webContents.on('crashed', (event, isKilled) => {
    const message = logger.error('[Window] Crashed', { event, isKilled })
    captureException(new Error(message))
    callback('crashed')
  })

  webContents.on('plugin-crashed', (event, name, version) => {
    const message = logger.error('[Window] Plugin crashed', { event, name, version })
    captureException(new Error(message))
    callback('plugin-crashed')
  })

  webContents.on('certificate-error', (event, url, error, certificate) => {
    const message = logger.error('[Window] Certificate error', { event, url, error, certificate })
    captureException(new Error(message))
    callback('certificate-error')
  })

  webContents.on('console-message', (level, message, line, sourceId) => {
    logger.info('[Console]', { level, message, line, sourceId })
  })

  mainWindow.loadURL(settings.url)

  return mainWindow
}

module.exports = { open }
