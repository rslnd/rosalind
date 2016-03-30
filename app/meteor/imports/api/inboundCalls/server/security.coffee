{ InboundCalls } = require '/imports/api'
{ Security } = require 'meteor/ongoworks:security'

module.exports = ->
  Security.permit(['insert', 'update', 'remove']).collections([ InboundCalls ])
    .ifHasRole('admin').apply()

  Security.permit(['insert', 'update']).collections([ InboundCalls ])
    .ifHasRole('inboundCalls').apply()
