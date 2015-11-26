Meteor.publishComposite 'inboundCalls', (tableName, ids, fields) ->
  check(tableName, Match.Optional(String))
  check(ids, Match.Optional(Array))
  check(fields, Match.Optional(Object))

  return unless (@userId and Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP))

  @unblock()

  if ids
    {
      find: ->
        @unblock()
        InboundCalls.find({ _id: { $in: ids } }, { removed: true })
      children: [
        {
          find: (inboundCall) ->
            @unblock()
            Comments.find({ docId: inboundCall._id })
        }
      ]
    }
  else
    {
      find: -> InboundCalls.find({})
      children: [
        { find: (inboundCall) -> Comments.find({ docId: inboundCall._id }) }
      ]
    }
