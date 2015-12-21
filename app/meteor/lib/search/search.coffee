@Search = {}

Search.options =
  index: 'rosalind'

Search.index = (docOrId, type) ->
  return unless Meteor.isServer
  doc = Helpers.findOneByIdAndCollection(docOrId, type)
  Elasticsearch.index
    index: Search.options.index
    type: type or doc.collection()._name
    id: doc._id
    body: _.omit(doc, '_id')

Search.unindex = (doc, type) ->
  return unless Meteor.isServer
  Elasticsearch.delete
    index: Search.options.index
    type: type or doc.collection()._name
    id: doc._id
