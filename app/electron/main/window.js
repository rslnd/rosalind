const includes = require('lodash/includes')
const { app, session, BrowserWindow } = require('electron')
const logger = require('./logger')
const settings = require('./settings')
const { captureException } = require('@sentry/electron')

const open = (callback) => {
  const { screen } = require('electron')
  const display = screen.getPrimaryDisplay().workAreaSize

  app.on('web-contents-created', (event, contents) => {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload
      delete webPreferences.preloadURL

      // Disable Node.js integration
      webPreferences.nodeIntegration = false

      // Deny, or verify URL being loaded
      event.preventDefault()

      logger.info('[Window] Denied attaching webview', params)
    })

    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      if (parsedUrl.origin !== 'https://*.rslnd.com') {
        event.preventDefault()
        logger.info('[Window] Denied navigation to', navigationUrl)
      }
    })

    contents.on('new-window', (event, navigationUrl) => {
      event.preventDefault()
      logger.info('[Window] Denied opening new window', navigationUrl)
    })
  })

  const ephemeralSession = session
    .fromPartition('in-memory')
    .setPermissionRequestHandler((webContents, permission, grantPermission) => {
      // Deny all
      grantPermission(false)
    })

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
      preload: require.resolve('../renderer/preload'),
      nodeIntegration: false,
      contextIsolation: false, // TODO: Rework native API
      session: ephemeralSession,
      textAreasAreResizable: false,
      subpixelFontScaling: true,
      overlayScrollbars: false,
      webgl: false,
      webaudio: false
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
    callback(new Error('did-fail-load'))
  })

  webContents.on('crashed', (event, isKilled) => {
    const message = logger.error('[Window] Crashed', { event, isKilled })
    captureException(new Error(message))
    callback(new Error('crashed'))
  })

  webContents.on('plugin-crashed', (event, name, version) => {
    const message = logger.error('[Window] Plugin crashed', { event, name, version })
    captureException(new Error(message))
    callback(new Error('plugin-crashed'))
  })

  webContents.on('certificate-error', (event, url, error, certificate) => {
    const message = logger.error('[Window] Certificate error', { event, url, error, certificate })
    captureException(new Error(message))
    callback(new Error('certificate-error'))
  })

  webContents.on('console-message', (event, level, message, line, sourceId) => {
    logger.info('[Console]', message, sourceId, line)
  })

  mainWindow.loadURL(settings.url)

  return mainWindow
}

module.exports = { open }
