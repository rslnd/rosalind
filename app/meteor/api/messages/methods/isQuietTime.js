import moment from 'moment'

export const dayTimeFrom = (m) => m.hour(6).minute(59)
export const dayTimeTo = (m) => m.hour(20).minute(31)

export const isDayTime = (time) => {
  const now = moment(time).clone().tz(process.TZ_CLIENT || 'Europe/Vienna')
  const from = dayTimeFrom(now.clone())
  const to = dayTimeTo(now.clone())
  return now.isBetween(from, to)
}

export const isQuietTime = (time) => {
  return !isDayTime(time)
}
