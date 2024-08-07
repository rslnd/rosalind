import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { normalizeName } from '../../../patients/util/normalizeName'

const parseFirstName = (query) => {
  if (query && query.trim()) {
    return {
      result: {
        firstNameNormalized: {
          $regex: '^' + normalizeName(query),
          $options: 'i'
        }
      }
    }
  } else {
    return { result: false, remainingQuery: query }
  }
}

export const parseExactName = (query, forcePartialMatching) => {
  if (query && query[0] === '_') {
    return parseFirstName(query.substr(1))
  }

  // Split query into single words
  const pattern = /([^-\s]{1,})/g
  const match = query && query.match(pattern)
  const remainingQuery = query && query.replace(pattern, '')

  if (!match) {
    return { result: false, remainingQuery: query }
  }

  // Build list of potential last names
  const names = uniq([ match.join('-'), match.join(''), ...match ]
    .filter(identity)
    .filter((w) => w.length > 0)
  )

  const firstWord = ([...query.match(/([^\s]{1,})/g)]
    .filter(identity)
    .filter((w) => w.length > 0)[0]) || names[0]

  if (names && names.length === 1) {
    const normalized = normalizeName(names[0])
    if (normalized) {
      // console.log('XXX exact match of one last name', normalized)
      let result = {}
      // Force exact match for short queries to avoid unnecessary fetching
      // was <= 4 - maybe < 3 is too aggressive? watch db perf
      if (!forcePartialMatching && normalized.length < 3) {
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

      return { result, remainingQuery }
    }
  }

  if (names && names.length >= 2) {
    // Always match the first (non-combined) fragment as start of last name
    const normalized = normalizeName(firstWord)
    if (normalized) {
      let result = {
        'lastNameNormalized': {
          $regex: '^' + normalized
        }
      }

      // In addition to requiring the last name to be at least a partial match,
      // ???

      // [a, b] => [ab, a]
      // [a, b, c] => [abc, ab, a]
      // [a, b, c, d] => [abcd, abc, ab, a]
      const namePermutations = names =>

        [
          ...names.map((n, i) =>
            [
              ...names.slice(0, i),
              n
            ].filter(identity).join('-')
          ).reverse(),
          ...names.map((n, i) =>
            [
              ...names.slice(0, i),
              n
            ].filter(identity).join('')
          ).reverse(),
        ]

      result.$or = [
        // This matches combined last names such as "van der Bellen"
        ...namePermutations(names).map(n => ({
          lastNameNormalized: {
            $regex: '^' + normalizeName(n),
            $options: 'i'
          }
        })),
        // Try to match all tokens as first name too
        ...names.map(n => ({
          firstNameNormalized: {
            $regex: '^' + n,
            $options: 'i'
          }
        }))
      ].filter(identity)

      return { result, remainingQuery }
    }

    return { result: false, remainingQuery: query }
  } else {
    return { result: false, remainingQuery: query }
  }
}
