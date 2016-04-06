_ = require 'lodash'
electron = require 'app'
BrowserWindow = require 'browser-window'
logger = require './logger'
settings = require './settings'

DEV = _.includes(process.argv, '--dev')

module.exports =
  open: (callback) ->
    screen = require 'screen'
    display = screen.getPrimaryDisplay().workAreaSize

    mainWindow = new BrowserWindow
      x: display.x
      y: display.y
      width: display.width
      height: display.height
      minWidth: 560
      minHeight: 426
      disableAutoHideCursor: true
      webPreferences:
        preload: require.resolve('../renderer/native')
        nodeIntegration: false
        textAreasAreResizable: false
        experimentalCanvasFeatures: true
        subpixelFontScaling: true
        overlayScrollbars: false

    mainWindow.maximize()

    mainWindow.on 'closed', ->
      electron.quit()

    webContents = mainWindow.webContents
    webContents.openDevTools() if DEV

    callbackCalled = false
    webContents.on 'did-finish-load', ->
      callback(null) unless callbackCalled
      callbackCalled = true


    webContents.on 'devtools-opened', ->
      logger.warn('[Window] Developer Tools opened')

    webContents.on 'devtools-closed', ->
      logger.warn('[Window] Developer Tools closed')

    webContents.on 'did-fail-load', ->
      logger.error('[Window] Failed to load')
      callback('did-fail-load')

    webContents.on 'crashed', ->
      logger.error('[Window] Crashed')
      callback('crashed')

    webContents.on 'plugin-crashed', ->
      logger.error('[Window] Plugin Crashed')
      callback('plugin-crashed')

    webContents.on 'certificate-error', ->
      logger.error('[Window] Certificate error')
      callback('certificate-error')


    mainWindow.loadURL(settings.url)

    return mainWindow
