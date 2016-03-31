{ Meteor } = require 'meteor/meteor'
{ Tracker } = require 'meteor/tracker'

module.exports = ->
  return unless window.native

  loggedIn = false
  lastUser = null

  Tracker.autorun ->
    if currentUser = Meteor.user()
      window.native.users.onLogin(currentUser) unless loggedIn
      loggedIn = true
      lastUser = currentUser
    else if lastUser
      window.native.users.onLogout(lastUser)
      loggedIn = false
      lastUser = null


  window.native.ipc.on 'users/getToken', ->
    Meteor.call 'users/getToken', (err, token) ->
      return console.error('[Users] Token', err) if err
      window.native.users.getToken(token)
