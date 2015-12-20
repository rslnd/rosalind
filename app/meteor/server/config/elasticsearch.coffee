es = Meteor.npmRequire('elasticsearch')
esClient = new es.Client
  host: Meteor?.settings?.private?.elasticsearch?.host or 'localhost:9200'

methods = [
  'index'
  'delete'
  'search'
]

@ElasticSearch = Async.wrap esClient, methods
