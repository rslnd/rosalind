Meteor.publishComposite 'patients', (tableName, ids, fields) ->
  check(tableName, Match.Optional(String))
  check(ids, Match.Optional(Array))
  check(fields, Match.Optional(Object))

  return unless (@userId and Roles.userIsInRole(@userId, ['patients', 'admin'], Roles.GLOBAL_GROUP))

  @unblock()

  if ids
    {
      find: ->
        @unblock()
        Patients.find(_id: { $in: ids })
      children: [
        {
          find: (doc) ->
            @unblock()
            Comments.find(docId: doc._id)
        }
      ]
    }
  else
    {
      find: -> Patients.find({})
      children: [
        { find: (doc) -> Comments.find(docId: doc._id) }
      ]
    }
