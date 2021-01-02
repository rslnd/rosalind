import fromPairs from 'lodash/fromPairs'
import range from 'lodash/range'
import memoizeRaw from 'lodash/memoize'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { monkey } from 'spotoninc-moment-round'

const moment = extendMoment(momentTz)
monkey(moment)

const cacheKeyResolver = (a, b, c) => [a, '~', b, '$', c].join('')
const memoize = fn => memoizeRaw(fn, cacheKeyResolver)

export const start = () => moment().hour(7).minute(30).startOf('minute')
export const end = () => moment().hour(20).endOf('hour')

export const isFirstSlot = m => {
  const first = start().floor(5, 'minutes')
  return first.hour() === m.hour() && first.minute() === m.minute()
}
export const isLastSlot = m => {
  const last = end().ceil(5, 'minutes')
  return last.hour() === m.hour() && last.minute() === m.minute()
}

export const hour = t => t.substr(1, 2)
export const minute = t => t.substr(-2, 2)

export const isSlot = (slotSize, offsetMinutes, atMinutes) => {
  const slotsPerHour = Math.ceil(60 / slotSize)
  const slotMinutes = (offsetMinutes === 0 || offsetMinutes > 0)
    ? [offsetMinutes]
    : range(0, slotsPerHour).map(s => s * slotSize)

  const filteredSlotMinutes = (atMinutes && atMinutes.length >= 1)
    ? atMinutes
    : slotMinutes

  return (t) => {
    return filteredSlotMinutes.indexOf(parseInt(minute(t))) !== -1
  }
}

export const isFullHour = memoize(t => (
  minute(t) === '00'
))

export const isQuarterHour = memoize(t => {
  const m = minute(t)
  return (m === '00' || m === '15' || m === '30' || m === '45')
})

export const label = t => t.format('[T]HHmm')

const minutes = (from, to, slotSize = 1) =>
  Array.from(
    moment.range(from, to)
      .by('minutes', {
        step: slotSize,
        excludeEnd: true
      })
  ).map(t => moment(t))

const dayMinutes = minutes(start(), end())

export const timeSlotsRange = ({ slotSize, from, to }) =>
  minutes(from, to, slotSize)
    .filter()
    .map(label)

export const timeSlots = memoize((slotSize, offsetMinutes, atMinutes) =>
  dayMinutes
    .map(label)
    .filter(isSlot(slotSize, offsetMinutes, atMinutes)))

export const timeSlotsFormatted = memoize((slotSize, offsetMinutes, atMinutes) =>
  fromPairs(
    timeSlots(slotSize, offsetMinutes, atMinutes)
      .map(t => [t, `${parseInt(hour(t))}:${minute(t)}`])))

export const formatter = memoize((slotSize, offsetMinutes, atMinutes) =>
  memoize(t => timeSlotsFormatted(slotSize, offsetMinutes, atMinutes)[t]))

export const setTime = t => m => m.clone().hour(hour(t)).minute(minute(t)).startOf('minute')
