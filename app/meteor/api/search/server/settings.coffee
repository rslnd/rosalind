Elasticsearch = require './elasticsearch'

index = 'rosalind_v1'
name = 'rosalind'

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


module.exports = ->
  try
    unless Elasticsearch.indices.exists({ index })
      console.warn("[Search] Creating index #{index}")
      Elasticsearch.indices.create(index: index, body: indexSettings)

    unless Elasticsearch.indices.existsAlias({ name })
      Elasticsearch.indices.putAlias({ index, name })
      console.warn("[Search] Creating alias #{name}")
  catch e
    console.warn(e)
