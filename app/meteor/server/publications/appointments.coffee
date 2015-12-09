Meteor.publishComposite 'appointments', (tableName, ids, fields) ->
  check(tableName, Match.Optional(String))
  check(ids, Match.Optional(Array))
  check(fields, Match.Optional(Object))

  return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

  @unblock()

  if ids
    {
      find: ->
        @unblock()
        Appointments.find({ _id: { $in: ids } }, { removed: true })
      children: [
        {
          find: (doc) ->
            @unblock()
            Comments.find({ docId: doc._id })
        }
      ]
    }
  else
    {
      find: -> Appointments.find({})
      children: [
        { find: (doc) -> Comments.find({ docId: doc._id }) }
      ]
    }
