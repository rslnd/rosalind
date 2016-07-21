module.exports =
  insert: (options) ->
    fn = (options) ->
      _ = require 'lodash'
      inflection = require 'lodash-inflection'
      TestUtil = require 'test-util'
      _.mixin(inflection)

      collectionName = _.pluralize(options.collection)
      collectionName = TestUtil.camelize(collectionName, true)
      collection = Api[collectionName]

      attributes = TestUtil.transformAttributes(options.attributes)

      collection.insert(attributes)

    server.execute(fn, options)
