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
  const [ year, month, day ] = s.split('-')
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10)
  }
}

export default {
  zeroIndexMonth,
  dateToDay,
  dayToDate,
  dayToSlug
}
