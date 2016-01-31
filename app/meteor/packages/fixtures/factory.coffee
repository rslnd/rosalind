Meteor.methods 'fixtures/createRecord': (options) ->
  check options, Object

  if process.env.NODE_ENV isnt 'development'
    throw new Error 'Testing code somehow made it into production'

  collection = _.pluralize(options.collection)
  collection = TestUtil.camelize(collection)
  collection = TestUtil.constantize(collection)
  attributes = TestUtil.transformAttributes(options.attributes)
  collection.insert(attributes)
