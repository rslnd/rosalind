import identity from 'lodash/identity'
import { normalizePhoneNumber } from '../../../messages/methods/normalizePhoneNumber'

const pattern = /(.?\d+.?)+/g

export const parseContact = (query) => {
  const match = query && query.match(pattern)

  if (!match) {
    return { result: false, remainingQuery: query }
  }

  const remainingQuery = query.replace(pattern, '').trim()

  const phone = normalizePhoneNumber(match[0].replace(/[^\d]/g, ''))

  const insuranceId = match[0].replace(/[^\d]/g, '')

  // console.log('XXX phone', phone)

  const queries = [
    (phone && phone.length >= 9) && // prevent a query like 43660 from returning 10k+ results, eg. require at least 3 useful digits
    {
      'contacts.valueNormalized': {
        $regex: '^' + phone
      }
    },
    (insuranceId && (insuranceId.length === 10 || insuranceId.length === 4)) &&
    { insuranceId }
  ].filter(identity)

  if (queries && queries.length >= 1) {
    const selector = {
      $or: queries
    }
    return { result: selector, remainingQuery }
  } else {
    return { result: false, remainingQuery: query }
  }
}
