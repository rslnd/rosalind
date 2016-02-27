Meteor.startup ->
  Reports.after.insert (userId, doc) ->
    Winston.info('[Report] inserted:', doc.day)

  Reports.after.update (userId, doc) ->
    Winston.info('[Report] updated:', doc.day)

  Reports.after.remove (userId, doc) ->
    Winston.info('[Report] removed:', doc.day)
