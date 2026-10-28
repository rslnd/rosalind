import moment from 'moment-timezone'
import range from 'lodash/range'

// Minutes within each hour at which the day view has a grid line.
// Mirrors isSlot() in client/appointments/dayView/grid/timeSlots.js
export const slotMinutes = ({ slotSize = 5, scheduleOffset, atMinutes } = {}) => {
  if (atMinutes && atMinutes.length >= 1) {
    return [...atMinutes].sort((a, b) => a - b)
  }

  if (scheduleOffset === 0 || scheduleOffset > 0) {
    return [scheduleOffset]
  }

  return range(0, Math.ceil(60 / slotSize)).map(s => s * slotSize)
}

// Round an end time up to the next grid line of the calendar, so that
// the appointment ends on an existing row (eg. 8:05 -> 8:10 when slots are at :00, :10, ...)
export const ceilToSlot = ({ calendar, date }) => {
  const m = moment(date).startOf('minute')
  const minutes = slotMinutes({
    slotSize: (calendar && calendar.slotSize) || 5,
    scheduleOffset: calendar && calendar.scheduleOffset,
    atMinutes: calendar && calendar.atMinutes
  })

  const next = minutes.find(s => s >= m.minute())

  return (next === undefined)
    ? m.add(1, 'hour').minute(minutes[0])
    : m.minute(next)
}
