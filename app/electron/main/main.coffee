path = require 'path'
module.paths.push(path.resolve('node_modules'))
module.paths.push(path.resolve('../node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app', 'node_modules'))
module.paths.push(path.resolve(__dirname, '..', '..', '..', '..', 'resources', 'app.asar', 'node_modules'))

{ app, ipcMain } = require 'electron'
require './debugger'
updater = require './updater'
window = require './window'
logger = require './logger'
systemInfo = require './systemInfo'

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
      watch.start(ipcReceiver: mainWindow)
      print.start(ipcReceiver: mainWindow)
      shortcuts.updateShortcuts()
      ipcMain.on 'window/load', (e) =>
        settings.send(ipcReceiver: mainWindow)
        updater.sendVersion(ipcReceiver: mainWindow)
        systemInfo.send(ipcReceiver: mainWindow)

    updater.start()
    setTimeout(updater.check, 5 * 1000)
    setInterval(updater.check, 60 * 1000)

  app.on 'window-all-closed', ->
    updater.quitAndInstall()
    watch.stop()
    app.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()