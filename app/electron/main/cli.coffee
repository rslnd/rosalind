{ app } = require 'electron'
logger = require './logger'

module.exports =
  handleStartupEvent: (callback) ->
    shouldQuit = app.makeSingleInstance (argv, cwd) ->
      logger.info('[CLI] Other instance was launched in', cwd, argv)
      callback(argv, cwd)

    if shouldQuit
      logger.info('[CLI] Quitting because other instance is already running')
      return true
