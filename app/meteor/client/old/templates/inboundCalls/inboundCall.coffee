{ InboundCalls } = require '/imports/api/inboundCalls'
{ Comments } = require '/imports/api/comments'
{ CommentsContainer } = require '/imports/ui/comments'

Template.inboundCall.helpers
  CommentsContainer: ->
    CommentsContainer

Template.inboundCall.events
  'click .resolve': ->
    InboundCalls.softRemove(@_id)

  'click .unresolve': (e) ->
    InboundCalls.restore(@_id)

    $('.modal').find('form [type="submit"]').click()

    Modal.hide()

Template.inboundCallsUnresolve.events
  'click .unresolve': ->
    InboundCalls.restore(@_id)
