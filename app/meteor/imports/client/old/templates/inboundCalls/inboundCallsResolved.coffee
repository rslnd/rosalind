import './inboundCallsResolved.tpl.jade'
import table from '../../../../api/inboundCalls/table'

Template.inboundCallsResolved.helpers
  table: ->
    table
