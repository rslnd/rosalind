import { parseBirthday } from './parseBirthday'
import { parseExactLastName } from './parseExactLastName'

export const parseQuery = (query) => {
  if (!query) {
    return false
  }

  let parsed = {}

  const { result, remainingQuery } = parseBirthday(query)

  if (result) {
    parsed = { ...parsed, ...result }
  }

  if (remainingQuery && remainingQuery.length > 0) {
    const { result } = parseExactLastName(remainingQuery)
    if (result) {
      parsed = { ...parsed, ...result }
    }
  }

  if (Object.keys(parsed).length > 0) {
    return parsed
  } else {
    return false
  }
}
