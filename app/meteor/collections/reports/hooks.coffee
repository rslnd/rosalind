Meteor.startup ->
  Reports.after.insert (userId, doc) ->
    console.log('[Report] inserted:', doc.day)

  Reports.after.update (userId, doc) ->
    console.log('[Report] updated:', doc.day)

  Reports.after.remove (userId, doc) ->
    console.log('[Report] removed:', doc.day)
