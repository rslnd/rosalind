electron = require 'app'
updater = require './updater'
window = require './window'
logger = require './logger'
settings = require './settings'
cli = require './cli'
bdt = require './bdt'

mainWindow = null
bdtWatcher = null

start = ->
  logger.start()

  return electron.quit() if updater.handleStartupEvent()
  return electron.quit() if cli.handleStartupEvent(focus)

  electron.on 'ready', ->
    setTimeout(updater.check, 15 * 1000)
    bdtWatcher = bdt.watch()
    mainWindow = window.open()

  electron.on 'window-all-closed', ->
    bdtWatcher.close()
    electron.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()
