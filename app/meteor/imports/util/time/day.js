import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import clone from 'lodash/clone'

const moment = extendMoment(momentTz)

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
    if (isNaN(year)) { return null }
    const month = m.month() + 1
    if (isNaN(month)) { return null }
    const day = m.date() // no typo
    if (isNaN(day)) { return null }

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

export const rangeToDays = ({ from, to }) => {
  const range = moment.range(from, to)
  const days = Array.from(range.by('days')).map(t => moment(t))
  return days
    .filter(m => m.day() !== 0)
    .map(dateToDay)
}

export const dayToString = d => [
  d.year,
  d.month,
  d.day
].join('-')

export const stringToDay = s => {
  const [year, month, day] = s.split('-')
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10)
  }
}

export const isSame = (a, b) =>
  a.day === b.day &&
  a.year === b.year &&
  zeroIndexMonth(a).month === zeroIndexMonth(b).month

export const daySelector = (d, prefix = 'day') => ({
  [[prefix, 'year'].join('.')]: d.year,
  [[prefix, 'month'].join('.')]: d.month,
  [[prefix, 'day'].join('.')]: d.day
})

export default {
  zeroIndexMonth,
  dateToDay,
  dayToDate,
  dayToSlug
}

// The server runs in UTC (moment.tz.setDefault('UTC')), but days are days of
// the practice. These helpers work in the practice's timezone on both sides.
export const PRACTICE_TZ = 'Europe/Vienna'

// Start and end (Date) of a { year, month, day } in the practice's timezone
export const dayBounds = (day, tz = PRACTICE_TZ) => {
  const m = moment.tz({ year: day.year, month: day.month - 1, day: day.day }, tz)
  return {
    start: m.clone().startOf('day').toDate(),
    end: m.clone().endOf('day').toDate()
  }
}

// Days ({ year, month, day }) between two dates in the practice's timezone,
// without Sundays (like rangeToDays)
export const rangeToDaysInTz = ({ from, to }, tz = PRACTICE_TZ) => {
  const days = []
  const cursor = moment.tz(from, tz).startOf('day')
  const end = moment.tz(to, tz)
  while (cursor.isSameOrBefore(end) && days.length < 1000) {
    if (cursor.day() !== 0) {
      days.push({ year: cursor.year(), month: cursor.month() + 1, day: cursor.date() })
    }
    cursor.add(1, 'day')
  }
  return days
}

// Start of the first / end of the last day of a date range in the practice's timezone
export const rangeBounds = ({ from, to }, tz = PRACTICE_TZ) => ({
  start: moment.tz(from, tz).startOf('day').toDate(),
  end: moment.tz(to, tz).endOf('day').toDate()
})
