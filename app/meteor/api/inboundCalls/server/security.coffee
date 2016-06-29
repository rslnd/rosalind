{ InboundCalls } = require 'api'

module.exports = ->
  InboundCalls.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply()
  InboundCalls.permit(['insert', 'update']).ifHasRole('inboundCalls').apply()
