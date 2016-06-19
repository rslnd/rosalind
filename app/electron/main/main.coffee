electron = require 'app'
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
  return electron.quit() if updater.handleStartupEvent()
  return electron.quit() if cli.handleStartupEvent(focus)

  electron.on 'ready', ->
    mainWindow = window.open (err) ->
      return logger.error('[Main] Could not load main window', err) if err
      logger.ready('[Main] Main window loaded')
      importers.start(ipcReceiver: mainWindow)
      print.start(ipcReceiver: mainWindow)
      shortcuts.updateShortcuts()


    authentication.start(ipcReceiver: mainWindow)
    updater.start()
    setTimeout(updater.check, 15 * 1000)

  electron.on 'window-all-closed', ->
    importers.stop()
    electron.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()
