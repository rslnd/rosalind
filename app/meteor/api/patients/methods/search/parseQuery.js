import { parseBirthday } from './parseBirthday'
import { parseExactLastName } from './parseExactLastName'

export const parseQuery = (query) => {
  if (!query) {
    return false
  }

  let parsed = {}

  const { result, remainingQuery } = parseBirthday(query)

  if (result) {
    return { ...parsed, ...result }
  }

  console.log(result)

  if (remainingQuery && remainingQuery.length > 0) {
    const { result } = parseExactLastName(remainingQuery)
    if (result) {
      return { ...parsed, ...result }
    } else {
      return false
    }
  }

  return false
}
