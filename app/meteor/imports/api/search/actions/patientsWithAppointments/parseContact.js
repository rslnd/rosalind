import { normalizePhoneNumber } from '../../../messages/methods/normalizePhoneNumber'

const pattern = /(\d+.?)+/g

export const parseContact = (query) => {
  const match = query && query.match(pattern)

  if (!match) {
    return { result: false, remainingQuery: query }
  }

  const remainingQuery = query.replace(pattern, '').trim()

  const phone = normalizePhoneNumber(match[0].replace(/[^\d]/g, ''))

  if (phone && phone.length >= 8) { // prevent a query like 43660 from returning 10k+ results, eg. require at least 3 useful digits
    const selector = {
      'contacts.valueNormalized': {
        $regex: '^' + phone
      }
    }
    return { result: selector, remainingQuery }
  } else {
    return { result: false, remainingQuery: query }
  }
}
