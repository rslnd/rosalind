import moment from 'moment-timezone'
import clone from 'lodash/clone'

export const zeroIndexMonth = (day) => {
  if (day) {
    let d = clone(day)
    if (d.month && !d.zeroIndexMonth) {
      d.month -= 1
      d.zeroIndexMonth = true
    }
    return d
  }
}

export const dateToDay = (date) => {
  if (date) {
    const m = moment(date)
    const year = m.year()
    const month = m.month() + 1
    const day = m.date() // no typo
    return { year, month, day }
  }
}

export const dayToDate = (day) => {
  const d = zeroIndexMonth(day)
  return moment(d).toDate()
}

export const dayToSlug = (day) => {
  const date = dayToDate(day)
  return moment(date).format('YYYY-MM-DD')
}

export default {
  zeroIndexMonth,
  dateToDay,
  dayToDate,
  dayToSlug
}
