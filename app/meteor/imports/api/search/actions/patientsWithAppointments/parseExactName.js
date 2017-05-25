import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { normalizeName } from '../../../patients/util/normalizeName'

export const parseExactName = (query) => {
  // Split query into single words
  const pattern = /([^-\s]{1,})/g
  const match = query.match(pattern)
  const remainingQuery = query.replace(pattern, '')

  // Build list of potential last names
  const names = uniq([ match.join(''), ...match ]
    .filter(identity)
    .filter((w) => w.length > 0)
  )

  if (names && names.length > 0) {
    // Build selector from this list
    const $or = names.map((name) => {
      return {
        'profile.lastNameNormalized': normalizeName(name)
      }
    })

    let result = { $or }

    if (names.length >= 2) {
      const firstName = names[names.length - 1]

      result['profile.firstName'] = {
        $regex: '^' + firstName,
        $options: 'i'
      }
    }

    return { result, remainingQuery }
  } else {
    return { result: false, remainingQuery }
  }
}
