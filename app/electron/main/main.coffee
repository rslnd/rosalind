{ app } = require 'electron'
updater = require './updater'
window = require './window'
logger = require './logger'

logger.start()

settings = require './settings'
cli = require './cli'
authentication = require './authentication'
importers = require './importers'
print = require './print'
shortcuts = require './shortcuts'

mainWindow = null
bdtWatcher = null

start = ->
  return app.quit() if updater.handleStartupEvent()
  return app.quit() if cli.handleStartupEvent(focus)

  app.on 'ready', ->
    mainWindow = window.open (err) ->
      return logger.error('[Main] Could not load main window', err) if err
      logger.ready('[Main] Main window loaded')
      importers.start(ipcReceiver: mainWindow)
      print.start(ipcReceiver: mainWindow)
      shortcuts.updateShortcuts()


    authentication.start(ipcReceiver: mainWindow)
    updater.start()
    setTimeout(updater.check, 15 * 1000)

  app.on 'window-all-closed', ->
    updater.quitAndInstall()
    importers.stop()
    app.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()
