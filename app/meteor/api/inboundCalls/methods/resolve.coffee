{ Meteor } = require 'meteor/meteor'

module.exports = ({ InboundCalls }) ->
  methods =
    resolve: (_id) ->
      check(_id, String)

      Meteor.call 'events/post',
        type: 'inboundCalls/resolve'
        level: 'info'
        payload: { inboundCallId: _id, userId: Meteor.userId() }

      InboundCalls.softRemove(_id)

  Meteor.methods({ 'inboundCalls/resolve': methods.resolve })

  return methods
