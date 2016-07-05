{ Meteor } = require 'meteor/meteor'

module.exports = ({ InboundCalls }) ->
  methods =
    unresolve: (_id) ->
      check(_id, String)

      Meteor.call 'events/post',
        type: 'inboundCalls/unresolve'
        level: 'info'
        payload: { inboundCallId: _id, userId: Meteor.userId() }

      InboundCalls.restore(_id)

  Meteor.methods({ 'inboundCalls/unresolve': methods.unresolve })

  return methods
