module.exports =
  insert: (options) ->
    fn = (options) ->
      { pluralize } = require 'lodash-inflection'
      TestUtil = require 'test-util'

      collectionName = pluralize(options.collection)
      collectionName = TestUtil.camelize(collectionName)
      collection = Api[collectionName]

      attributes = TestUtil.transformAttributes(options.attributes)

      collection.insert(attributes)

    server.execute(fn, options)
