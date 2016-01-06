winston = require('winston')
electron = require('app')

module.exports =
  start: ->
    winston.add winston.transports.File,
      filename: path.join(electron.getPath('userData'), 'electron.log')
      json: false
      maxsize: 1024 * 1024 * 10
      maxFiles: 1
      eol: '\r\n'

    winston.info('[Log] App launched')
    winston.info('[Log] App version: ', electron.getVersion())
    winston.info('[Log] Command line arguments: ', process.argv)

    process.on 'uncaughtException', (err) ->
      winston.error('[Main] Uncaught Exception:', err)

    electron.on 'quit', ->
      winston.info('[Log] App quit')

  debug: winston.debug
  info: winston.info
  warn: winston.warn
  error: winston.error
