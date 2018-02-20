import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { normalizeName } from '../../../patients/util/normalizeName'

export const parseExactName = (query) => {
  // Split query into single words
  const pattern = /([^-\s]{1,})/g
  const match = query && query.match(pattern)
  const remainingQuery = query && query.replace(pattern, '')

  // Build list of potential last names
  const names = uniq([ match.join(''), ...match ]
    .filter(identity)
    .filter((w) => w.length > 0)
  )

  if (names && names.length > 0) {
    const normalized = normalizeName(names[1] || names[0])
    if (normalized) {
      let result = {}

      // Force exact match for short queries to avoid unnecessary fetching
      if (normalized.length <= 4) {
        result = {
          'lastNameNormalized': normalized
        }
      } else {
        result = {
          'lastNameNormalized': {
            $regex: '^' + normalized
          }
        }
      }

      if (names.length >= 2) {
        const firstName = normalizeName(names[names.length - 1])
        if (firstName) {
          result['firstName'] = {
            $regex: '^' + firstName,
            $options: 'i'
          }
        }
      }

      return { result, remainingQuery }
    }
  } else {
    return { result: false, remainingQuery: query }
  }
}
