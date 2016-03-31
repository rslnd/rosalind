{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'

module.exports = ->
  Meteor.methods
    'event': (type, options = {}, payload = {}) ->
      check(type, String)
      check(options, Object)
      check(payload, Object)

      return unless Meteor.userId() or options.userId
      payload = undefined if Object.keys(payload).length is 0

      Events.insert
        type: type
        level: options.level or 'info'
        createdBy: Meteor.userId() or options.userId
        createdAt: new Date()
        payload: payload
