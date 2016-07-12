{ Mongo } = require 'meteor/mongo'

Template.deleteThis.events
  'click [rel="delete"]': ->
    console.log('[Meteor] Delete', @)
    collection = Mongo.Collection.get(@collection) if typeof @collection is 'string'
    collection = @collection() if typeof @collection is 'function'

    collection.softRemove(@_id)
