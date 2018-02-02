import { parseBirthday } from './parseBirthday'
import { parseExactName } from './parseExactName'
import { parseContact } from './parseContact'

export const parseQuery = (query) => {
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
    if (contact.result) {
      parsed = { ...parsed, ...contact.result }
    }
  }

  if (birthday.remainingQuery && birthday.remainingQuery.length > 0) {
    const name = parseExactName(birthday.remainingQuery)
    if (name.result) {
      parsed = { ...parsed, ...name.result }
    }
  }

  if (Object.keys(parsed).length > 0) {
    return parsed
  } else {
    return false
  }
}
