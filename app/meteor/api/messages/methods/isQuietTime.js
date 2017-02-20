import moment from 'moment-timezone'

export const dayTimeFrom = (m) => m.hour(9).startOf('hour')
export const dayTimeTo = (m) => m.hour(15).endOf('hour')

export const isDayTime = (time) => {
  const now = moment(time).clone().tz(process.TZ_CLIENT || 'Europe/Vienna')
  const from = dayTimeFrom(now.clone()).subtract(1, 'second')
  const to = dayTimeTo(now.clone()).add(1, 'second')

  return (from.isSameOrBefore(now) && to.isSameOrAfter(now))
}

export const isSunday = (time) => {
  return (moment(time).isoWeekday() === 7)
}

export const isQuietTime = (time) => {
  return !isDayTime(time) || isSunday(time)
}
