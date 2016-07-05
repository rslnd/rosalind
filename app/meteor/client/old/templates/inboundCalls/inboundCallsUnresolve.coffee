{ Meteor } = require 'meteor/meteor'

Template.inboundCallsUnresolve.events
  'click .unresolve': ->
    Meteor.call('inboundCalls/unresolve', @_id)
