Meteor.startup ->
  Patients.after.insert (userId, doc) ->
    Winston.info('[Patient] inserted:', doc._id)
    Search.index('patients', @_id)

  Patients.after.update (userId, doc) ->
    Winston.info('[Patient] updated:', doc._id)
    Search.index('patients', doc)

  Patients.after.remove (userId, doc) ->
    Winston.info('[Patient] removed:', doc._id)
    Search.unindex('patients', doc)
