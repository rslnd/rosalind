Meteor.startup ->
  Meteor.call 'getSentryClientKey', (err, sentryClientKey) ->
    if sentryClientKey?
      Raven.config(sentryClientKey, {}).install()

      Meteor.autorun ->
        user = Meteor.user()
        if user?
          Raven.setUser
            id: user._id
            username: user.username
            name: user.fullNameWithTitle()
        else
          Raven.setUser()

@Winston =
  debug: (msg, meta) -> Winston.log('debug', msg, meta)
  info: (msg, meta) -> Winston.log('info', msg, meta)
  warn: (msg, meta) -> Winston.log('warn', msg, meta)
  error: (msg, meta) -> Winston.log('error', msg, meta)
  log: (level, msg, meta) ->
    meta = {} unless meta?
    meta.url = window.location.href
    meta.userAgent = navigator.userAgent
    Meteor.call('winston/log', { level, msg, meta })


window.lastError = null
window.onerror = (message, url, line, col, error) ->
  window.lastError = { message, url, line, col, error }
  Winston.error('[Client] ' + message, { url, line, col, error })
