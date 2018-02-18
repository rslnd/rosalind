import fromPairs from 'lodash/fromPairs'
import range from 'lodash/range'
import memoize from 'lodash/memoize'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { monkey } from 'spotoninc-moment-round'

const moment = extendMoment(momentTz)
monkey(moment)

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

export const isSlot = slotSize => (t) => {
  const slotsPerHour = Math.ceil(60 / slotSize)
  const slotMinutes = range(0, slotsPerHour).map(s => s * slotSize)

  return slotMinutes.includes(parseInt(minute(t)))
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

export const timeSlots = memoize(slotSize => timeRange.map(label).filter(isSlot(slotSize)))

export const timeSlotsFormatted = memoize(slotSize => fromPairs(timeSlots(slotSize).map(t => [t, `${parseInt(hour(t))}:${minute(t)}`])))

export const formatter = memoize(slotSize => memoize(t => timeSlotsFormatted(slotSize)[t]))

export const setTime = (t) => (m) => m.clone().hour(hour(t)).minute(minute(t)).startOf('minute')
