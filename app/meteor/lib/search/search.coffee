@Search = {}

Search.options =
  index: 'rosalind'

Search.index = (doc, type) ->
  return unless Meteor.isServer
  console.log '[Search] index:', ElasticSearch.index
    index: Search.options.index
    type: type or doc.collection()._name
    id: doc._id
    body: _.omit(doc, '_id')

Search.unindex = (doc, type) ->
  return unless Meteor.isServer
  console.log '[Search] unindex:', ElasticSearch.delete
    index: Search.options.index
    type: type or doc.collection()._name
    id: doc._id
