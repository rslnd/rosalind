import fromPairs from 'lodash/fromPairs'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { monkey } from 'spotoninc-moment-round'

const moment = extendMoment(momentTz)
monkey(moment)

const start = moment().hour(7).minute(30).startOf('minute')
const end = moment().hour(20).endOf('hour')

export const hour = (t) => t.substr(1, 2)
export const minute = (t) => t.substr(-2, 2)

export const isSlot = (t) => {
  const lastDigit = t[t.length - 1]
  return (lastDigit === '0' || lastDigit === '5')
}

export const isFullHour = (t) => (
  minute(t) === '00'
)

export const isQuarterHour = (t) => {
  const m = minute(t)
  return (m === '00' || m === '15' || m === '30' || m === '45')
}

export const label = (t) => t.format('[T]HHmm')

export const timeRange = Array.from(moment.range(start, end).by('minutes')).map(t => moment(t))

export const timeSlots = timeRange.map(label).filter(isSlot)

export const timeSlotsFormatted = fromPairs(timeSlots.map(t => [t, `${parseInt(hour(t))}:${minute(t)}`]))

export const format = (t) => timeSlotsFormatted[t]

export const setTime = (t) => (m) => m.clone().hour(hour(t)).minute(minute(t)).startOf('minute')
