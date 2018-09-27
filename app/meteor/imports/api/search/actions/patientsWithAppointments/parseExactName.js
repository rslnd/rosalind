import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { normalizeName } from '../../../patients/util/normalizeName'

export const parseExactName = (query) => {
  // Split query into single words
  const pattern = /([^-\s]{1,})/g
  const match = query && query.match(pattern)
  const remainingQuery = query && query.replace(pattern, '')

  if (!match) {
    return { result: false, remainingQuery: query }
  }

  // Build list of potential last names
  const names = uniq([ match.join(''), ...match ]
    .filter(identity)
    .filter((w) => w.length > 0)
  )

  if (names && names.length > 0) {
    const normalized = normalizeName(names[1] || names[0])
    if (normalized) {
      let result = {
        $or: []
      }

      // Force exact match for short queries to avoid unnecessary fetching
      if (normalized.length <= 4) {
        result.$or.push({
          'lastNameNormalized': normalized
        })
      } else {
        result.$or.push({
          'lastNameNormalized': {
            $regex: '^' + normalized
          }
        })
      }

      if (names.length >= 2) {
        // [a, b] => [ab, a]
        // [a, b, c] => [abc, ab, a]
        // [a, b, c, d] => [abcd, abc, ab, a]
        const namePermutations = names =>
          names.map((n, i) =>
            [
              ...names.slice(0, i),
              n
            ].filter(identity).join('')
          ).reverse()

        const firstName = normalizeName(names[names.length - 1])
        if (firstName) {
          result.$or = [
            ...namePermutations(names).map(n => ({
              lastNameNormalized: {
                $regex: '^' + n,
                $options: 'i'
              }
            })),
            firstName.length >= 2 && {
              'firstName': {
                $regex: '^' + firstName,
                $options: 'i'
              }
            }
          ]
        }
      }

      return { result, remainingQuery }
    } else {
      return { result: false, remainingQuery: query }
    }
  } else {
    return { result: false, remainingQuery: query }
  }
}
