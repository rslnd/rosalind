import keyBy from 'lodash/fp/keyBy'
import mapValues from 'lodash/fp/mapValues'
import mapKeys from 'lodash/mapKeys'
import idx from 'idx'

export const mapUserIds = ({ Users }) => {
  const users = Users.find({}).fetch()
  const keyed = keyBy(u => idx(u, _ => _.external.eoswin.id))(users)
  const mapping = mapValues('_id')(keyed)
  delete mapping.undefined
  const normalized = mapKeys(mapping, (v, k) => normalizeEoswinId(k))
  return id => normalized[normalizeEoswinId(id)]
}

// HACK: Hardcoded id mappings
export const specialAssigneeType = id => {
  switch (normalizeEoswinId(id)) {
    case 12: return 'external'
  }
}

const normalizeEoswinId = id =>
  parseInt(id.match(/[0-9]+/))
