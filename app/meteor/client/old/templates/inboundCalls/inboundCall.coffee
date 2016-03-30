{ InboundCalls } = require '/imports/api/inboundCalls'
{ Comments } = require '/imports/api/comments'

Template.inboundCall.events
  'click .resolve': ->
    InboundCalls.softRemove(@_id)

  'click .unresolve': (e) ->
    InboundCalls.restore(@_id)

    pendingComment = $(e.target).parents('.modal').find('.add-comment-body').val()
    if (pendingComment.length > 0)
      Comments.insert({ body: pendingComment, docId: @_id })

    Modal.hide()

Template.inboundCallsUnresolve.events
  'click .unresolve': ->
    InboundCalls.restore(@_id)
