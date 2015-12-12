electron = require('app')

module.exports =
  handleStartupEvent: (callback) ->
    shouldQuit = electron.makeSingleInstance (argv, cwd) ->
      console.log('[CLI] Other instance was launched in', cwd, argv)
      callback(argv, cwd)

    if shouldQuit
      console.log('[CLI] Quitting because other instance is already running')
      return true
