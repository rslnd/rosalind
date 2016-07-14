{ InboundCalls } = require 'api/inboundCalls'

Template.inboundCallsUnresolve.events
  'click .unresolve': ->
    InboundCalls.methods.unresolve({ _id: @_id })
