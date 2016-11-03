import map from 'lodash/fp/map'
import identity from 'lodash/identity'
import { normalizeName } from '../../../patients/util/normalizeName'

export const parseExactLastName = (query) => {
  const pattern = /(\w{2,})/g
  const match = query.match(pattern)
  const remainingQuery = query.replace(pattern, '')

  const $or = map((token) => {
    token = normalizeName(token)
    if (token.length > 1) {
      return { 'profile.lastNameNormalized': token }
    }
  })(match).filter(identity)

  if ($or.length > 0) {
    return { result: { $or }, remainingQuery }
  } else {
    return { result: false, remainingQuery }
  }
}
