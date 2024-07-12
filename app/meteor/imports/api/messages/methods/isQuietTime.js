import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import some from 'lodash/some'

const moment = extendMoment(momentTz)

export const dayTimeFrom = (m) => m.hour(9).startOf('hour')
export const dayTimeTo = (m) => m.hour(21).endOf('hour')

export const isDayTime = (time) => {
  const now = time.clone().tz(process.TZ_CLIENT || 'Europe/Vienna')
  const from = dayTimeFrom(now.clone()).subtract(1, 'second')
  const to = dayTimeTo(now.clone()).add(1, 'second')

  return (from.isSameOrBefore(now) && to.isSameOrAfter(now))
}

export const isWeekend = (m) => {
  return (m.isoWeekday() === 7 || m.isoWeekday() === 6)
}

export const isHolidays = (holidays = []) => {
  const ranges = holidays.map((h) => moment.range(h.start, h.end))

  return (m) => some(ranges, (range) => moment(m).within(range))
}

export const isQuietTime = (time) => {
  const m = moment(time)
  return !isDayTime(m) || isWeekend(m)
}
