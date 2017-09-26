import { InboundCalls } from '../'

module.exports = ->
  InboundCalls.permit(['insert', 'update', 'remove']).ifHasRole('admin').allowInClientCode()
  InboundCalls.permit(['insert', 'update']).ifHasRole('inboundCalls').allowInClientCode()
