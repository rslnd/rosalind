Meteor.publishComposite 'inboundCalls', ->
  return unless (@userId and Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP))

  {
    find: -> InboundCalls.find({})
    children: [
      { find: (inboundCall) -> Comments.find({ docId: inboundCall._id }) }
    ]
  }
