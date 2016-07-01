{ InboundCalls } = require 'api/inboundCalls'
{ InboundCallsContainer } = require 'client/ui/inboundCalls'

Template.inboundCalls.onCreated ->
  @autorun =>
    @subscribe('inboundCalls')

Template.inboundCalls.helpers
  inboundCalls: ->
    InboundCalls.find({})

  InboundCallsContainer: ->
    InboundCallsContainer
