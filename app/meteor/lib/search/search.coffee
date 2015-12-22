@Search = {}

Search.options =
  index: 'rosalind'

Search.index = (type, docOrId) ->
  return unless Meteor.isServer
  doc = Helpers.findOneByIdAndCollection(docOrId, type)
  Elasticsearch.index
    index: Search.options.index
    type: type
    id: doc._id
    body: _.omit(doc, '_id')

Search.unindex = (type, doc) ->
  return unless Meteor.isServer
  Elasticsearch.delete
    index: Search.options.index
    type: type
    id: doc._id

Search.query = (type, queryObject) ->
  result = Elasticsearch.search
    index: Search.options.index
    type: type
    body: queryObject

  data = result.hits.hits.map (doc) ->
    sourceDoc = _.clone(doc._source)
    sourceDoc._score = doc._score
    sourceDoc._id = doc._id
    sourceDoc

  metadata =
    total: result.hits.total
    took: result.took

  response =
    data: data
    metadata: metadata
