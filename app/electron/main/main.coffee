electron = require 'app'
updater = require './updater'
window = require './window'
logger = require './logger'
settings = require './settings'
cli = require './cli'

mainWindow = null

start = ->
  logger.start()

  return electron.quit() if updater.handleStartupEvent()
  return electron.quit() if cli.handleStartupEvent(focus)

  electron.on 'ready', ->
    setTimeout(updater.check, 15 * 1000)
    mainWindow = window.open()

  electron.on 'window-all-closed', ->
    electron.quit()

focus = ->
  return unless mainWindow
  mainWindow.restore() if mainWindow.isMinimized()
  mainWindow.focus()

start()
