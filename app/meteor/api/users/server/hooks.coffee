{ Events } = require 'api/events'

module.exports = ->
  Accounts.onLoginFailure (attempt) ->
    Events.insert
      type: 'users/loginFailed'
      level: 'error'
      createdBy: attempt?.user?._id
      createdAt: new Date()
      payload: attempt
