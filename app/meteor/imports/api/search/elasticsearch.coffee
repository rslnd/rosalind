es = require('elasticsearch')

esOptions =
  apiVersion: '2.2'

methods =
  global: [
    'index'
    'delete'
    'search'
    'bulk'
  ]

  indices: [
    'putSettings'
    'putMapping'
    'getMapping'
    'exists'
    'create'
    'putAlias'
    'existsAlias'
    'open'
    'close'
  ]

url = process.env.ELASTICSEARCH_URL
if url
  if url.indexOf(',') > 0
    hosts = url.substr(url.indexOf('//') + 2).split(',')
    proto = url.substr(0, url.indexOf('//') + 2)
    hosts = hosts.map (a) -> proto + a
    esOptions.hosts = hosts
  else
    esOptions.host = url
else
  esOptions.host = 'localhost:9200'

esClient = new es.Client(esOptions)

Elasticsearch = Async.wrap(esClient, methods.global)
Elasticsearch.indices = Async.wrap(esClient.indices, methods.indices)

module.exports = Elasticsearch
