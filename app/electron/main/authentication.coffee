logger = require './logger'
{ ipcMain } = require 'electron'

unless @Users
  @Users =
    start: (@options) ->
      ipcMain.on('users/onLogin', (e, x) => @onLogin(e, x))
      ipcMain.on('users/onLogout', (e, x) => @onLogout(e, x))
      ipcMain.on('users/getToken', (e, x) => @getToken(e, x))

    options: {}
    currentUser: null
    tokenCallbacks: []

    onLogin: (e, user) ->
      logger.info('[Users] Logged in', { username: user.username })
      @currentUser = user

    onLogout: (e, user) ->
      logger.info('[Users] Logged out', { username: user.username })
      @currentUser = null

    getToken: (e, token) ->
      callback = @tokenCallbacks.pop()
      return unless callback
      return callback('No token') unless token
      return callback('Not logged in') unless @currentUser

      auth =
        token: token
        headers:
          'X-User-Id': @currentUser._id
          'X-Auth-Token': token

      return callback(null, auth)

    withToken: (callback) ->
      @options.ipcReceiver.webContents.send('users/getToken')
      @tokenCallbacks.push(callback)


module.exports = @Users
