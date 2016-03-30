module.exports = (collection) ->
  collection.after.insert (userId, doc) ->
    console.log('[Report] inserted:', doc.day)

  collection.after.update (userId, doc) ->
    console.log('[Report] updated:', doc.day)

  collection.after.remove (userId, doc) ->
    console.log('[Report] removed:', doc.day)
