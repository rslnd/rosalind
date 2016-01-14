logger = require('./logger')
ipc = require('electron').ipcMain

unless @Authentication
  @Authentication =
    start: (@options) ->
      ipc.on('authentication/onLogin', (e, x) => @onLogin(e, x))
      ipc.on('authentication/onLogout', (e, x) => @onLogout(e, x))
      ipc.on('authentication/getToken', (e, x) => @getToken(e, x))

    options: {}
    currentUser: null
    tokenCallbacks: []

    onLogin: (e, user) ->
      logger.info('[Authentication] Logged in', { username: user.username })
      @currentUser = user

    onLogout: (e, user) ->
      logger.info('[Authentication] Logged out', { username: user.username })
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
      @options.ipcReceiver.webContents.send('authentication/getToken')
      @tokenCallbacks.push(callback)


module.exports = @Authentication
