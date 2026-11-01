import { applyHM } from '../../schedules/methods/transformDefaultsToOverrides'
import { gridSlotsWithin } from './ceilToSlot'
import { dayBounds } from '../../../util/time/day'

// Server-side equivalent of the DSL `openBookable` slot logic: for a given day
// and assignee, create bookable appointment slots covering the provided time
// ranges (eg. the working blocks marked "online bookable" in the default
// schedule, or the open time of a column).
//
// Slots run from one grid line of the calendar's day view to the next (slot
// size or atMinutes), so they never overlap and always line up with the rows.
// A slot that would stick out of its range is dropped instead of being cut
// short at an off-grid time. Slots overlapping an existing (non-bookable)
// appointment or any blocked range, or starting before `notBefore`, are
// skipped.
export const createBookableSlots = ({ Appointments }) => async ({ calendar, calendarId, userId, day, ranges, blockedRanges = [], notBefore, createdBy }) => {
  if (!ranges || ranges.length === 0) { return 0 }

  // In the practice's timezone, the server runs in UTC
  const { start: dayStart, end: dayEnd } = dayBounds(day)

  // Existing appointments that block a slot (bookables do not block). Fetch by
  // overlap, so appointments reaching into the day from before/after count too.
  const existing = await Appointments.find({
    calendarId,
    assigneeId: userId,
    start: { $lt: dayEnd },
    end: { $gt: dayStart },
    removed: { $ne: true },
    canceled: { $ne: true }
  }).fetchAsync()

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

  const toDate = min => applyHM(day, { h: Math.floor(min / 60), m: min % 60 })

  let created = 0

  for (const { from, to } of ranges) {
    const fromMin = from.h * 60 + (from.m || 0)
    const toMin = to.h * 60 + (to.m || 0)

    for (const { startMin, endMin } of gridSlotsWithin({ calendar, fromMin, toMin })) {
      const slotStart = toDate(startMin)
      const slotEnd = toDate(endMin)

      if (notBefore && slotStart < notBefore) { continue }
      if (isBlocked(slotStart, slotEnd)) { continue }

      // Avoid duplicates (eg. overlapping ranges, or bookables left in place).
      const dupe = await Appointments.findOneAsync({
        calendarId,
        assigneeId: userId,
        type: 'bookable',
        start: slotStart,
        end: slotEnd,
        removed: { $ne: true }
      })
      if (dupe) { continue }

      await Appointments.insertAsync({
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
  }

  return created
}
