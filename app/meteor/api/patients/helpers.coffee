filter = require 'lodash/filter'
extend = require 'lodash/extend'
Time = require 'util/time'

module.exports =
  notes: ->
    n = [@note, @external?.eoswin?.note]
    return filter(n, (s) -> s and s.length >= 1).join('\n')
