import filter from 'lodash/filter'
import extend from 'lodash/extend'
import Time from '../../util/time'

module.exports =
  notes: ->
    n = [@note, @external?.eoswin?.note]
    return filter(n, (s) -> s and s.length >= 1).join('\n')
