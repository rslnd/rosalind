{ SearchSource } = require 'meteor/meteorhacks:search-source'
{ Search } = require 'api/search'

module.exports = ->
  SearchSource.defineSource 'patients', (queryString, options) ->
    return unless queryString? or queryString.length < 2

    Search.query 'patients',
      query:
        bool:
          minimum_should_match: 2
          should: [
            {} =
              match:
                'profile.fullNameWithTitle':
                  query: queryString
                  operator: 'and'
                  slop: 10
                  boost: 10
                  fuzziness: 0

            {} =
              match:
                'profile.fullNameWithTitleAutocomplete':
                  query: queryString
                  operator: 'and'
                  slop: 10
                  boost: 3
                  fuzziness: 1

            {} =
              match:
                'profile.fullNameWithTitlePhonetic':
                  query: queryString
                  operator: 'and'
                  slop: 10
                  fuzziness: 1

            {} =
              match:
                'profile.titlePrepend':
                  query: queryString
                  operator: 'or'
                  boost: 3
                  fuzziness: 1
          ]
