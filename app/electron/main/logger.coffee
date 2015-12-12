electron = require('app')

module.exports =
  start: ->
    console.log('[Log] App version: ', electron.getVersion())
    console.log('[Log] Command line arguments: ', process.argv)

    process.on 'uncaughtException', (err) ->
      console.error('[Main] Uncaught Exception:', err)
