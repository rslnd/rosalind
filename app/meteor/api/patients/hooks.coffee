module.exports = (collection) ->
  collection.after.insert (userId, doc) ->
    console.log('[Patient] inserted:', doc._id)
    # Search.index('patients', @_id)

  collection.after.update (userId, doc) ->
    console.log('[Patient] updated:', doc._id)
    # Search.index('patients', doc)

  collection.after.remove (userId, doc) ->
    console.log('[Patient] removed:', doc._id)
    # Search.unindex('patients', doc)
