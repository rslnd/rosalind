import moment from 'moment-timezone'
import sortBy from 'lodash/sortBy'
import { slotMinutes } from '../../appointments/methods/ceilToSlot'
import { PRACTICE_TZ } from '../../../util/time/day'

// Grid range of the day view (client/appointments/dayView/grid/timeSlots.js):
// every minute from 7:30 up to and including 20:59.
const FIRST_MINUTE = 7 * 60 + 30
const LAST_MINUTE = 20 * 60 + 59

// Blocked gaps up to this length inside a working period count as a pause
// instead of splitting the period in two.
const MAX_PAUSE_MINUTES = 60

// Slots of one doctor column, exactly as the day view's column header counts
// them ("6 frei von 30 Slots", renderCounts in AppointmentsGrid.js): a slot is
// blocked when it lies inside a blocking schedule, and occupied when it is
// covered by a (non-bookable) appointment.
//
//   day:          { year, month, day }
//   schedules:    override/overlay schedules of this doctor in this calendar on that day
//   appointments: appointments of this doctor in this calendar on that day
const gridSlots = ({ day, calendar, assignee, schedules = [], appointments = [] }) => {
  const { slotSize, slotSizeAppointment, atMinutes } = calendar

  const scheduleOffset = slotSizeAppointment &&
    (assignee && assignee.schedules && assignee.schedules.length >= 1) &&
    moment.tz(sortBy(assignee.schedules, 'end')[0].end, PRACTICE_TZ).add(1, 'second').minute()

  const slotSizeBlank = (scheduleOffset === 0 || scheduleOffset > 0)
    ? slotSizeAppointment
    : (slotSize || 5)

  const minutes = slotMinutes({ slotSize: slotSizeBlank, scheduleOffset, atMinutes })

  const dayStart = moment.tz({ year: day.year, month: day.month - 1, date: day.day }, PRACTICE_TZ)
  const starts = []
  for (let m = FIRST_MINUTE; m <= LAST_MINUTE; m++) {
    if (minutes.indexOf(m % 60) !== -1) {
      starts.push(dayStart.clone().hour(Math.floor(m / 60)).minute(m % 60).toDate())
    }
  }

  const blocking = schedules.filter(s => !s.available && (!s.roles || s.roles.length === 0))
  const occupying = appointments.filter(a => a.type !== 'bookable')

  return starts.map((start, i) => ({
    start,
    // A slot reaches up to the next grid line
    end: starts[i + 1] || moment(start).add(slotSizeBlank, 'minutes').toDate(),
    slotSize: slotSizeBlank,
    blocked: blocking.some(s => (start >= s.start && start < s.end)),
    occupied: occupying.some(a => (start >= a.start && start < a.end))
  }))
}

const count = slots => ({
  slotsAvailable: slots.length,
  slotsUsed: slots.filter(s => s.occupied).length
})

// Available (= not blocked) and used (= also occupied) slots of one doctor column.
export const headerSlots = (args) =>
  count(gridSlots(args).filter(s => !s.blocked))

// Working periods of one doctor column (runs of unblocked slots), with the same
// slot counts as the column header. Short blocked gaps become pauses.
export const headerAvailabilities = (args) => {
  const periods = []
  let current = null
  let gap = []

  gridSlots(args).forEach(slot => {
    if (slot.blocked) {
      if (current) { gap.push(slot) }
      return
    }

    const gapMinutes = gap.length
      ? (gap[gap.length - 1].end - gap[0].start) / 60 / 1000
      : 0

    if (current && gapMinutes <= MAX_PAUSE_MINUTES) {
      if (gap.length) {
        current.pauses.push({ from: gap[0].start, to: gap[gap.length - 1].end, slots: gap.length })
        current.slots.push(...gap)
      }
    } else {
      if (current) { periods.push(current) }
      current = { slots: [], pauses: [] }
    }

    current.slots.push(slot)
    gap = []
  })
  if (current) { periods.push(current) }

  return periods.map(({ slots, pauses }) => {
    const from = slots[0].start
    const to = slots[slots.length - 1].end
    return {
      from,
      to,
      duration: Math.round((to - from) / 60 / 1000),
      slotSize: slots[0].slotSize,
      slotCount: slots.length,
      ...count(slots.filter(s => !s.blocked)),
      ...(pauses.length ? { pauses } : {})
    }
  })
}
