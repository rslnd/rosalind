electron = require 'app'
updater = require './updater'
window = require './window'

start = ->
  electron.setAppUserModelId('com.squirrel.rosalind.rosalind')

  updater.handleStartupEvent()

  electron.on 'ready', ->
    window.open()

  electron.on 'window-all-closed', ->
    electron.quit()

  process.on 'uncaughtException', (err) ->
    console.error('[Main] Uncaught Exception:', err)

start()
