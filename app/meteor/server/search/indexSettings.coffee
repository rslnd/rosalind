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

index = 'rosalind_v1'
name = 'rosalind'

Meteor.startup ->
  unless Elasticsearch.indices.exists({ index })
    Winston.info("[Search] Creating index #{index}")
    Elasticsearch.indices.create(index: index, body: indexSettings)
    Elasticsearch.indices.putMapping
      index: index
      type: 'patients'
      body: Search.mappings.patients

  unless Elasticsearch.indices.existsAlias({ name })
    Elasticsearch.indices.putAlias({ index, name })
    Winston.info("[Search] Creating alias #{name}")
