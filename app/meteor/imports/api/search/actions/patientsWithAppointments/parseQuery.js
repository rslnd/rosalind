import { parseBirthday } from './parseBirthday'
import { parseExactName } from './parseExactName'
import { parseContact } from './parseContact'

export const parseQuery = (query, forceNgramMatching) => {
  if (!query) {
    return false
  }

  let parsed = {}

  const birthday = parseBirthday(query)

  if (birthday.result) {
    parsed = { ...parsed, ...birthday.result }
  }

  if (birthday.remainingQuery && birthday.remainingQuery.length > 0) {
    const contact = parseContact(birthday.remainingQuery)
    if (contact && contact.result) {
      parsed = { ...parsed, ...contact.result }
    }
  }

  if (birthday.remainingQuery && birthday.remainingQuery.length > 0) {
    const name = parseExactName(birthday.remainingQuery, forceNgramMatching)
    if (name && name.result) {
      parsed = { ...parsed, ...name.result }
    }
  }

  if (Object.keys(parsed).length > 0) {
    return parsed
  } else {
    return false
  }
}
