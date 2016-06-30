module.exports =
  insert: (options) ->
    fn = (options) ->
      _ = require('lodash')
      _.mixin(require('lodash-inflection'))
      TestUtil = require 'test-util'

      collectionName = _.pluralize(options.collectionName)
      collectionName = TestUtil.camelize(collectionName)
      collection = require('api/' + TestUtil.camelize(collectionName, true))
      collection = collection[collectionName]

      attributes = TestUtil.transformAttributes(options.attributes)

      collection.insert(attributes)

    server.execute(fn, options)
