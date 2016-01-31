# taken from xolvio:cleaner
Meteor.methods 'fixtures/resetDatabase': (options) ->
  check(options, Match.Optional(Object))

  if process.env.NODE_ENV isnt 'development'
    throw new Error 'resetDatabase is not allowed outside of a mirror. Something has gone wrong.'

  options = options or {}

  excludedCollections = [ 'system.indexes' ]

  if options.excludedCollections
    excludedCollections = excludedCollections.concat(options.excludedCollections)

  db = MongoInternals.defaultRemoteCollectionDriver().mongo.db
  getCollections = Meteor.wrapAsync(db.collections, db)
  collections = getCollections()
  appCollections = _.reject collections, (col) ->
    col.collectionName.indexOf('velocity') is 0 or excludedCollections.indexOf(col.collectionName) isnt -1

  _.each appCollections, (appCollection) ->
    remove = Meteor.wrapAsync(appCollection.remove, appCollection)
    remove {}
