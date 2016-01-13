_ = require 'lodash'
electron = require 'app'
BrowserWindow = require 'browser-window'
logger = require './logger'
settings = require './settings'

DEV = _.contains(process.argv, '--dev')?

module.exports =
  open: (callback) ->
    screen = require 'screen'
    display = screen.getPrimaryDisplay().workAreaSize

    mainWindow = new BrowserWindow
      x: display.x,
      y: display.y,
      width: display.width,
      height: display.height,
      'min-width': 560,
      'min-height': 426,
      'disable-auto-hide-cursor': true,
      'preload': require.resolve('../renderer/native.js'),
      'node-integration': false,
      'web-preferences':
        'text-areas-are-resizable': false,
        'experimental-canvas-features': true,
        'subpixel-font-scaling': true,
        'overlay-scrollbars': false

    mainWindow.maximize()

    mainWindow.on 'closed', ->
      electron.quit()

    webContents = mainWindow.webContents
    webContents.openDevTools() if DEV?

    callbackCalled = false
    webContents.on 'did-finish-load', ->
      callback(null) unless callbackCalled
      callbackCalled = true

    webContents.on 'did-fail-load', ->
      Logger.error('[Window] Crashed')
      callback('did-fail-load')

    webContents.on 'crashed', ->
      Logger.error('[Window] Crashed')
      callback('crashed')

    webContents.on 'plugin-crashed', ->
      Logger.error('[Window] Plugin Crashed')
      callback('plugin-crashed')

    webContents.on 'certificate-error', ->
      Logger.error('[Window] Certificate error')
      callback('certificate-error')


    mainWindow.loadURL(settings.url)

    return mainWindow
