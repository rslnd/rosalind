os = require 'os'
path = require 'path'
url = require 'url'
includes = require 'lodash/includes'
winston = require 'winston'
require 'winston-papertrail'
{ ipcMain, app } = require 'electron'

module.exports =
  start: ->
    winston.add winston.transports.File,
      filename: path.join(app.getPath('userData'), 'RosalindElectron.log')
      level: 'debug'
      json: false
      maxsize: 1024 * 1024 * 10
      maxFiles: 1
      eol: '\r\n'

    # This section is set by Grunt on CI
    if '@@CI'.indexOf('@@') is -1
      host = '@@PAPERTRAIL_URL'.split(':')[0]
      port = parseInt('@@PAPERTRAIL_URL'.split(':')[1])

      try
        settings = require './settings'
        customerHostname = url.parse(settings.url).hostname
      catch e
        winston.error('[Log] Could not parse customer hostname for centralized logging, falling back to "development"', e)
        customerHostname = 'development'

      hostname = [os.hostname(), customerHostname].join('.')
      program = [ [ 'rosalind', os.platform(), os.arch() ].join('-'), app.getVersion() ].join('/')
      winston.info('[Log] Enabling papertrail log transport', { program, hostname })
      winston.add(winston.transports.Papertrail, { host, port, program, hostname })

    winston.info('[Log] App launched')
    winston.info('[Log] App version: ', app.getVersion())
    winston.info('[Log] Command line arguments: ', process.argv)

    process.on 'uncaughtException', (err) ->
      winston.error('[Main] Uncaught Exception:', err)

    app.on 'quit', ->
      winston.info('[Log] App quit')

    ipcMain.on 'log', (e, err) ->
      winston.log(err.level, err.message, err.payload)

  ready: (log) ->
    winston.info(log)

    if includes(process.argv, '--debug-quit-on-ready')
      winston.info('[Log] Debug: App launched successfully; now quitting')
      app.quit()


  debug: winston.debug
  info: winston.info
  warn: winston.warn
  error: winston.error
