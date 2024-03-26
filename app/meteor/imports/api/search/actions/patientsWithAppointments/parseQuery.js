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

  // console.log('XXX', 'remaining query after parsing birthday', birthday.remainingQuery)

  if (birthday.remainingQuery && birthday.remainingQuery.length > 0) {
    const contact = parseContact(birthday.remainingQuery)
    if (contact && contact.result) {
      parsed = { ...parsed, ...contact.result }
    }

    // console.log('XXX', 'remaining query after parsing contacts', contact.remainingQuery)

    if (contact.remainingQuery && contact.remainingQuery.length > 0) {
      const name = parseExactName(contact.remainingQuery, (forceNgramMatching || birthday.result))
      if (name && name.result) {
        parsed = { ...parsed, ...name.result }
      }
    }
  }

  // console.log('XXXY parsed', parsed)

  if (Object.keys(parsed).length > 0) {
    return parsed
  } else {
    return false
  }
}
