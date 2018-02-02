import { zerofix } from '../../../../util/zerofix'

const pattern = /(\d+.?)+/g

export const parseContact = (query) => {
  const match = query && query.match(pattern)

  if (!match) {
    return { result: false, remainingQuery: query }
  }

  const remainingQuery = query.replace(pattern, '').trim()

  const phone = zerofix(match[0].replace(/[^\d]/g, ''))

  if (phone) {
    const selector = {
      'profile.contacts.valueNormalized': {
        $regex: '^' + phone
      }
    }
    return { result: selector, remainingQuery }
  } else {
    return { result: false, remainingQuery: query }
  }
}
