{ app } = require 'electron'
updater = require './updater'
window = require './window'
logger = require './logger'

logger.start()

settings = require './settings'
cli = require './cli'
authentication = require './authentication'
print = require './print'
shortcuts = require './shortcuts'
watch = require './watch'
mainWindow = null

start = ->
  return app.quit() if updater.handleStartupEvent()
  return app.quit() if cli.handleStartupEvent(focus)

  app.on 'ready', ->
    mainWindow = window.open (err) ->
      return logger.error('[Main] Could not load main window', err) if err
      logger.ready('[Main] Main window loaded')
      watch.start(ipcReceiver: mainWindow)
      print.start(ipcReceiver: mainWindow)
      shortcuts.updateShortcuts()


    authentication.start(ipcReceiver: mainWindow)
    updater.start()
    setTimeout(updater.check, 15 * 1000)

  app.on 'window-all-closed', ->
    updater.quitAndInstall()
    watch.stop()
    app.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()
