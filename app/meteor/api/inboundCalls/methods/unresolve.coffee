{ Meteor } = require 'meteor/meteor'

module.exports = ({ InboundCalls }) ->
  unresolve: (_id) ->
    console.log('[InboundCalls] Unresolve', { userId: Meteor.userId(), inboundCallId: _id })
    InboundCalls.restore(@_id)
