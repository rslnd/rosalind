import { parseBirthday } from './parseBirthday'
import { parseExactName } from './parseExactName'

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
    const { result } = parseExactName(remainingQuery)
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
