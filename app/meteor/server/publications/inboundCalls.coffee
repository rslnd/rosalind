Meteor.publishComposite 'inboundCalls', (options = {}) ->
  check(options, Object)
  return unless (@userId and Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP))
  selector = _.pick(options, 'removed')

  {
    find: -> InboundCalls.find({}, selector)
    children: [
      { find: (inboundCall) -> Comments.find({ docId: inboundCall._id }) }
    ]
  }
