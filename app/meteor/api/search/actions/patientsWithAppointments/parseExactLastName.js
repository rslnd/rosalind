import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { normalizeName } from '../../../patients/util/normalizeName'

export const parseExactLastName = (query) => {
  // Split query into single words
  const pattern = /([^-\s]{2,})/g
  const match = query.match(pattern)
  const remainingQuery = query.replace(pattern, '')

  // Build list of potential last names
  const lastNames = uniq([ ...match, match.join('') ]
    .filter(identity)
    .filter((w) => w.length > 1)
    .map((w) => normalizeName(w))
  )

  if (lastNames && lastNames.length > 0) {
    // Build selector from this list
    const $or = lastNames.map((name) => {
      return {
        'profile.lastNameNormalized': name
      }
    })

    return { result: { $or }, remainingQuery }
  } else {
    return { result: false, remainingQuery }
  }
}
