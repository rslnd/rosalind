winston = require('winston')
path = require('path')
electron = require('app')
ipc = require('electron').ipcMain

module.exports =
  start: ->
    winston.add winston.transports.File,
      filename: path.join(electron.getPath('userData'), 'RosalindElectron.log')
      level: 'debug'
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

    ipc.on 'log', (e, err) ->
      winston.log(err.level, err.message, err.payload)


  debug: winston.debug
  info: winston.info
  warn: winston.warn
  error: winston.error
