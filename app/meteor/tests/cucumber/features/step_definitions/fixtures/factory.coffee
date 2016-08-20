module.exports =
  insert: (options) ->
    fn = (options) ->
      inflector = require 'inflected'
      TestUtil = require 'test-util'

      collectionName = inflector.pluralize(options.collection)
      collectionName = TestUtil.camelize(collectionName)
      collection = Api[collectionName]

      attributes = TestUtil.transformAttributes(options.attributes)

      collection.insert(attributes)

    server.execute(fn, options)
