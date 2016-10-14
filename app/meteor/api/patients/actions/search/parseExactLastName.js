import map from 'lodash/fp/map'
import { normalizeName } from '../../util/normalizeName'

export const parseExactLastName = (query) => {
  const pattern = /(\w{2,})/g
  const match = query.match(pattern)
  const remainingQuery = query.replace(pattern, '')

  const $or = map((token) => {
    token = normalizeName(token)
    return { 'profile.lastNameNormalized': token }
  })(match)

  if ($or.length > 0) {
    return { result: { $or }, remainingQuery }
  } else {
    return { result: false, remainingQuery }
  }
}
