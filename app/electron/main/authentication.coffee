logger = require('./logger')
ipc = require('electron').ipcMain

unless @Authentication
  @Authentication =
    initialize: ->
      ipc.on('authentication/onLogin', @onLogin)
      ipc.on('authentication/onLogout', @onLogout)

    currentUser: null

    onLogin: (e, user) ->
      logger.info('[Authentication] Logged in', { user })
      @currentUser = user

    onLogout: (e, user) ->
      logger.info('[Authentication] Logged out', { user })
      @currentUser = null


module.exports = @Authentication
