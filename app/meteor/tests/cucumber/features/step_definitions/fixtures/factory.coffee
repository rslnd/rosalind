module.exports =
  insert: (options) ->
    fn = (options) ->
      collection = _.pluralize(options.collection)
      collection = TestUtil.camelize(collection)
      collection = TestUtil.constantize(collection)
      attributes = TestUtil.transformAttributes(options.attributes)
      collection.insert(attributes)

    server.execute(fn, options)
