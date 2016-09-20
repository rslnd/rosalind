import moment from 'moment'

export const parseBirthday = (query) => {
  // Expect at least 1 digits
  if (!query.match(/\d+/)) {
    return { result: false, remainingQuery: query }
  }

  // FIXME: Support other ordering than DD.MM.(YY)YY
  const { result, remainingQuery } = parseDayMonthYear(query)
  let selector = {}

  if (result) {
    if (result.day) { selector['profile.birthday.day'] = result.day }
    if (result.month) { selector['profile.birthday.month'] = result.month }
    if (result.year) { selector['profile.birthday.year'] = result.year }
  }

  if (Object.keys(selector).length > 0) {
    return { result: selector, remainingQuery }
  } else {
    return { result: false, remainingQuery }
  }
}

export const parseDayMonthYear = (query) => {
  const pattern = /(\d\d?)[ .-/\\]((\d\d?)|(\w+))[ .-/\\](\d\d\d?\d?)?/
  const match = query.match(pattern)
  const remainingQuery = query.replace(pattern, '').trim()

  const result = (() => {
    if (match) {
      const day = parseInt(match[1])
      const month = parseMonth(match[2])

      if ((day <= 31) && (month <= 12)) {
        const year = parseYear(parseInt(match[5]))
        if (year) {
          return { day, month, year }
        } else {
          return { day, month }
        }
      } else {
        return false
      }
    } else {
      return { remainingQuery }
    }
  })()

  return { result, remainingQuery }
}

export const parseMonth = (month) => {
  if (month.match(/\d/)) {
    const numeric = parseInt(month)
    if (numeric > 0 && numeric <= 12) {
      return numeric
    }
  } else {
    const lookup = {
      jan: 1,
      jän: 1,
      jae: 1,
      feb: 2,
      fbr: 2,
      mär: 3,
      mrz: 3,
      mar: 3,
      mer: 3,
      mae: 3,
      apr: 4,
      mai: 5,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      spt: 9,
      okt: 10,
      oct: 10,
      nov: 11,
      dez: 12,
      dec: 12
    }
    const key = month.toLowerCase().substr(0, 3)
    const result = lookup[key]
    if (result) {
      return result
    } else {
      return false
    }
  }
}

const parseYear = (year) => {
  if (year < 100) {
    const currentYear = parseInt(moment().format('YY'))
    if (year < currentYear) {
      return 2000 + year
    } else {
      return 1900 + year
    }
  } else if (year > 1900) {
    return year
  } else {
    return false
  }
}
