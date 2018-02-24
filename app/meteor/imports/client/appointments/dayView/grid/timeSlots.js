import fromPairs from 'lodash/fromPairs'
import range from 'lodash/range'
import memoizeRaw from 'lodash/memoize'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { monkey } from 'spotoninc-moment-round'

const moment = extendMoment(momentTz)
monkey(moment)

const cacheKeyResolver = (a, b) => [a, '~', b].join('')
const memoize = fn => memoizeRaw(fn, cacheKeyResolver)

export const start = () => moment().hour(7).minute(30).startOf('minute')
export const end = () => moment().hour(20).endOf('hour')

export const isFirstSlot = (m) => {
  const first = start().floor(5, 'minutes')
  return first.hour() === m.hour() && first.minute() === m.minute()
}
export const isLastSlot = (m) => {
  const last = end().ceil(5, 'minutes')
  return last.hour() === m.hour() && last.minute() === m.minute()
}

export const hour = (t) => t.substr(1, 2)
export const minute = (t) => t.substr(-2, 2)

export const isSlot = (slotSize, offsetMinutes) => {
  const slotsPerHour = Math.ceil(60 / slotSize)
  const slotMinutes = (offsetMinutes === 0 || offsetMinutes > 0)
    ? [offsetMinutes]
    : range(0, slotsPerHour).map(s => s * slotSize)

  return (t) => {
    return slotMinutes.includes(parseInt(minute(t)))
  }
}

export const isFullHour = memoize((t) => (
  minute(t) === '00'
))

export const isQuarterHour = memoize((t) => {
  const m = minute(t)
  return (m === '00' || m === '15' || m === '30' || m === '45')
})

export const label = (t) => t.format('[T]HHmm')

const timeRange = Array.from(moment.range(start(), end()).by('minutes')).map(t => moment(t))

export const timeSlots = memoize((slotSize, offsetMinutes) =>
  timeRange.map(label).filter(isSlot(slotSize, offsetMinutes)))

export const timeSlotsFormatted = memoize((slotSize, offsetMinutes) =>
  fromPairs(timeSlots(slotSize, offsetMinutes).map(t => [t, `${parseInt(hour(t))}:${minute(t)}`])))

export const formatter = memoize((slotSize, offsetMinutes) =>
  memoize(t => timeSlotsFormatted(slotSize, offsetMinutes)[t]))

export const setTime = (t) => (m) => m.clone().hour(hour(t)).minute(minute(t)).startOf('minute')
