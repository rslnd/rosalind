import { InboundCalls } from 'api/inboundCalls'

Template.inboundCallsUnresolve.events
  'click .unresolve': ->
    InboundCalls.methods.unresolve.call({ _id: @_id })
