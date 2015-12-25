es = Meteor.npmRequire('elasticsearch')
esClient = new es.Client
  host: process.env.ELASTICSEARCH_URL or 'localhost:9200'

methods = [
  'index'
  'delete'
  'search'
]

@Elasticsearch = Async.wrap esClient, methods
