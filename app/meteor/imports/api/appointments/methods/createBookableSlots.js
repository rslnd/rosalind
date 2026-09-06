import moment from 'moment-timezone'
import { applyHM } from '../../schedules/methods/transformDefaultsToOverrides'

// Server-side equivalent of the DSL `openBookable` slot logic: for a given day
// and assignee, create bookable appointment slots covering the provided time
// ranges (the working blocks marked "online bookable" in the default schedule).
//
// Slots are aligned within each hour to the calendar's slot size (or the
// calendar's atMinutes, if configured), mirroring the day-grid blanks. Slots
// overlapping an existing (non-bookable) appointment or any blocked range are
// skipped.
export const createBookableSlots = ({ Appointments }) => ({ calendar, calendarId, userId, day, ranges, blockedRanges = [], createdBy }) => {
  if (!ranges || ranges.length === 0) { return 0 }

  const step = (calendar && calendar.slotSize) || 5
  const atMinutes = calendar && calendar.atMinutes

  const dayStart = applyHM(day, { h: 0, m: 0 })
  const dayEnd = moment(dayStart).endOf('day').toDate()

  // Existing appointments that block a slot (bookables do not block).
  const existing = Appointments.find({
    calendarId,
    assigneeId: userId,
    start: { $gte: dayStart },
    end: { $lte: dayEnd },
    removed: { $ne: true },
    canceled: { $ne: true }
  }).fetch()

  const isBlocked = (start, end) => {
    for (const appt of existing) {
      if (appt.type === 'bookable') { continue }
      if (start < appt.end && end > appt.start) { return true }
    }
    for (const r of blockedRanges) {
      if (start < r.end && end > r.start) { return true }
    }
    return false
  }

  const isValidStartMinute = m =>
    (atMinutes && atMinutes.length >= 1)
      ? atMinutes.indexOf(m) !== -1
      : (m % step === 0)

  let created = 0

  ranges.forEach(({ from, to }) => {
    const fromMin = from.h * 60 + (from.m || 0)
    const toMin = to.h * 60 + (to.m || 0)

    for (let min = fromMin; min < toMin; min++) {
      const m = min % 60
      if (!isValidStartMinute(m)) { continue }

      const slotStart = applyHM(day, { h: Math.floor(min / 60), m })
      const endMin = min + step
      const slotEnd = applyHM(day, { h: Math.floor(endMin / 60), m: endMin % 60 })

      if (isBlocked(slotStart, slotEnd)) { continue }

      // Avoid duplicates (old bookables in the range are removed beforehand).
      const dupe = Appointments.findOne({
        calendarId,
        assigneeId: userId,
        type: 'bookable',
        start: slotStart,
        end: slotEnd,
        removed: { $ne: true }
      })
      if (dupe) { continue }

      Appointments.insert({
        calendarId,
        assigneeId: userId,
        type: 'bookable',
        start: slotStart,
        end: slotEnd,
        createdAt: new Date(),
        createdBy
      })
      created++
    }
  })

  return created
}
