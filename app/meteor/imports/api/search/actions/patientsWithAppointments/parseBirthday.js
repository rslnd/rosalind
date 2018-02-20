import { fuzzyBirthday, pattern } from '../../../../util/fuzzy/fuzzyBirthday'

export const parseBirthday = (query) => {
  // Expect at least 1 digits
  if (!query.match(/\d+/)) {
    return { result: false, remainingQuery: query }
  }

  const remainingQuery = query.replace(pattern, '').trim()
  const result = fuzzyBirthday(query)
  let selector = {}

  if (result && result.day && result.month && result.year) {
    selector['birthday.day'] = result.day
    selector['birthday.month'] = result.month
    selector['birthday.year'] = result.year
  }

  if (Object.keys(selector).length > 0) {
    return { result: selector, remainingQuery }
  } else {
    return { result: false, remainingQuery: query }
  }
}
