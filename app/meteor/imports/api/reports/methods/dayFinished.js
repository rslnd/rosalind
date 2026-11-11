import moment from 'moment-timezone'
import { isCanceled } from './statistics'

export const TIMEZONE = 'Europe/Vienna'

// Hard end of the day: from here on the day always counts as finished, even if
// somebody is still open (forgotten check-out, patient who never shows up).
export const CUTOFF_HOUR = 22

// A patient who has not been checked in may still show up this long after the
// appointment ended. Only after that the appointment counts as a no-show.
export const NO_SHOW_GRACE_MS = 2 * 60 * 60 * 1000

// Time to mark the last no-shows / treatments before the report is sent
export const SETTLE_MS = 10 * 60 * 1000

const ts = d => d ? new Date(d).getTime() : null

// Point in time at which an appointment counts as settled; Infinity while it is
// still open (patient waiting or in treatment).
export const settledAt = (a, calendar = {}) => {
  if (a.noShow) { return ts(a.noShowAt) || 0 }
  if (a.dismissed && !a.admittedAt) { return ts(a.dismissedAt) || 0 }

  if (a.admittedAt) {
    if (a.treatmentEnd) { return ts(a.treatmentEnd) }
    if (a.treatmentStart) { return Infinity }
    // Calendars without a separate treatment step: checked in = done
    return calendar.admittedIsTreated ? ts(a.admittedAt) : Infinity
  }

  // Not checked in (yet)
  return (ts(a.end) || ts(a.start) || 0) + NO_SHOW_GRACE_MS
}

// Is the (today's) day finished, i.e. everybody is processed or the hard end of
// the day is reached? `finishedAt` is when that happened (or will happen at the
// latest), `reason` is 'done' (all appointments settled) or 'cutoff'.
export const dayStatus = ({ appointments = [], calendarsById = {}, day, now = new Date() }) => {
  const cutoffMs = moment
    .tz({ year: day.year, month: day.month - 1, day: day.day }, TIMEZONE)
    .hour(CUTOFF_HOUR)
    .valueOf()

  const open = appointments.filter(a => !isCanceled(a))
  const settledMs = open.reduce((latest, a) => Math.max(latest, settledAt(a, calendarsById[a.calendarId])), -Infinity)

  // No appointments at all: nothing to wait for, but also nothing to conclude early
  const byCutoff = !Number.isFinite(settledMs) || settledMs >= cutoffMs
  const finishedAt = byCutoff ? cutoffMs : settledMs

  return {
    finished: finishedAt <= new Date(now).getTime(),
    finishedAt: new Date(finishedAt),
    reason: byCutoff ? 'cutoff' : 'done'
  }
}

// When the e-mail may go out: right at the cutoff, otherwise shortly after the
// last appointment was settled.
export const sendAt = ({ finishedAt, reason }) =>
  new Date(finishedAt).getTime() + (reason === 'cutoff' ? 0 : SETTLE_MS)
