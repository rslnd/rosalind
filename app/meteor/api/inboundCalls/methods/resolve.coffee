{ Meteor } = require 'meteor/meteor'

module.exports = ({ InboundCalls }) ->
  resolve: (_id) ->
    console.log('[InboundCalls] Resolve', { userId: Meteor.userId(), inboundCallId: _id })
    InboundCalls.softRemove(_id)
