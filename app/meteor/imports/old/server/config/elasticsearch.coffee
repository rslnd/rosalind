es = require('elasticsearch')
esClient = new es.Client
  host: process.env.ELASTICSEARCH_URL or 'localhost:9200'

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
    'exists'
    'create'
    'putAlias'
    'existsAlias'
    'open'
    'close'
  ]


@Elasticsearch = Async.wrap(esClient, methods.global)
@Elasticsearch.indices = Async.wrap(esClient.indices, methods.indices)
