path = require 'path'
module.paths.push(path.resolve('node_modules'))
module.paths.push(path.resolve('../node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app', 'node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app.asar', 'node_modules'))

{ app } = require 'electron'
require('electron-debug')({ enabled: true })

updater = require './updater'
window = require './window'
logger = require './logger'

logger.start()

settings = require './settings'
cli = require './cli'
print = require './print'
shortcuts = require './shortcuts'
watch = require './watch'
mainWindow = null

start = ->
  return if updater.handleStartupEvent()
  return app.quit() if cli.handleStartupEvent(focus)

  app.on 'ready', ->
    mainWindow = window.open (err) ->
      return logger.error('[Main] Could not load main window', err) if err
      logger.ready('[Main] Main window loaded')
      settings.send(ipcReceiver: mainWindow)
      updater.send(ipcReceiver: mainWindow)
      watch.start(ipcReceiver: mainWindow)
      print.start(ipcReceiver: mainWindow)
      shortcuts.updateShortcuts()

    updater.start()
    setInterval(updater.check, 5 * 60 * 1000)

  app.on 'window-all-closed', ->
    updater.quitAndInstall()
    watch.stop()
    app.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()
