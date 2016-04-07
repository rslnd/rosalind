omit = require 'lodash/omit'
clone = require 'lodash/clone'
Elasticsearch = require './elasticsearch'
{ Meteor } = require 'meteor/meteor'

Search =
  options:
    index: 'rosalind'

Search.index = (type, docOrId) ->
  return unless Meteor.isServer
  doc = Helpers.findOneByIdAndCollection(docOrId, type)
  Elasticsearch.index
    index: Search.options.index
    type: type
    id: doc._id
    body: omit(doc, '_id')

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
    sourceDoc = clone(doc._source)
    sourceDoc._score = doc._score
    sourceDoc._id = doc._id
    sourceDoc

  metadata =
    total: result.hits.total
    took: result.took

  response =
    data: data
    metadata: metadata

Search.queryOne = (type, queryObject) ->
  response = Search.query(type, queryObject)
  return response.data[0]

Search.queryExactlyOne = (type, queryObject) ->
  response = Search.query(type, queryObject)
  return false if response.metadata.total isnt 1
  return response.data[0]

Search.putMapping = (type, mapping) ->
  console.log("[Search] Setting mapping for #{type}")
  Elasticsearch.indices.putMapping
    index: Search.options.index
    type: type
    body: mapping


module.exports = Search
