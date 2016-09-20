import moment from 'moment'
import { parseBirthday } from './parseBirthday'

export const parseQuery = (query) => {
  if (!query) {
    return {}
  }

  let parsed = {}

  const birthday = parseBirthday(query)
  if (birthday) {
    parsed = Object.assign(parsed, birthday)
  }

  return parsed
}
