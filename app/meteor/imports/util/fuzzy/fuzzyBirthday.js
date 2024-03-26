import moment from 'moment-timezone'
import { zerofix } from '../zerofix'

export const pattern = /(\d\d?)[ .\-/\\,]*((\d\d?)|([a-zA-Z]+))[ .\-/\\,]*(\d\d\d?\d?)?/

export const fuzzyBirthday = (query) => {
  const zerofixed = zerofix(query, { dontSplit: true })

  // Expect at least 1 digits
  if (!zerofixed || !zerofixed.match(/\d+/)) {
    return false
  }

  return fuzzyDayMonthYear(zerofixed)
}

export const fuzzyDayMonthYear = (query) => {
  const match = query.match(pattern)

  const dmy = (() => {
    if (match) {
      const day = parseInt(match[1])
      const month = fuzzyMonth(match[2])

      if ((day <= 31) && (month <= 12)) {
        const year = fuzzyYear(parseInt(match[5]))
        if (year) {
          return { day, month, year }
        } else {
          return { day, month }
        }
      } else {
        return false
      }
    } else {
      return false
    }
  })()

  const note = match && match[match.length - 1]

  if (note && note.trim()) {
    return { ...dmy, note: note.trim() }
  } else {
    return dmy
  }
}

export const fuzzyMonth = (month) => {
  if (month.match(/\d/)) {
    const numeric = parseInt(month)
    if (numeric > 0 && numeric <= 12) {
      return numeric
    }
  } else {
    const lookup = {
      jnn: 1,
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

const fuzzyYear = (year) => {
  if (year < 100) {
    const currentYear = parseInt(moment().format('YY'))
    if (year <= currentYear) {
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
