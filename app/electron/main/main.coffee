electron = require 'app'
updater = require './updater'
window = require './window'
logger = require './logger'

start = ->
  electron.setAppUserModelId('com.squirrel.rosalind.rosalind')

  logger.start()
  updater.handleStartupEvent()

  electron.on 'ready', ->
    setTimeout(updater.check, 15 * 1000)
    window.open()

  electron.on 'window-all-closed', ->
    electron.quit()

  process.on 'uncaughtException', (err) ->
    console.error('[Main] Uncaught Exception:', err)

start()
