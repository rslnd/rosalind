indexSettings =
  analysis:
    filter:
      phonetic_filter:
        type: 'phonetic',
        encoder: 'haasephonetik'

      autocomplete_filter:
        type: 'edge_ngram'
        min_gram: 1
        max_gram: 20

    analyzer:
      autocomplete:
        filter: [
          'lowercase'
          'autocomplete_filter'
        ]
        type: 'custom'
        tokenizer: 'standard'

      phonetic:
        filter: 'phonetic_filter'
        tokenizer: 'standard'

Meteor.startup ->
  unless Elasticsearch.indices.exists(index: 'rosalind_v1')
    Elasticsearch.indices.create(index: 'rosalind_v1')

  unless Elasticsearch.indices.existsAlias(name: 'rosalind')
    Elasticsearch.indices.putAlias(index: 'rosalind_v1', name: 'rosalind')

  Elasticsearch.indices.close(index: 'rosalind')
  Elasticsearch.indices.putSettings(index: 'rosalind', body: indexSettings)
  Elasticsearch.indices.open(index: 'rosalind')
