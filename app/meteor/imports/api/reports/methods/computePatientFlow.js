import moment from 'moment-timezone'
import { isCanceled, isNoShow, isKept, isOnline, isPrivate } from './statistics'
import { histogram, leadDays as leadDaysOf } from './leadTimeDistribution'

// Cap the exact-day lead-time axis so a single far-out booking can't stretch it.
const LEAD_CAP_DAYS = 120

// Patient-flow analysis over a freely chosen window, optionally filtered by
// doctor (assigneeId) and appointment type (tags), with an optional comparison
// window. Powers the "Patientenstromanalyse" section under the reports overview.
//
// The server runs on moment.tz.setDefault('UTC') (imports/startup/server/timezone.js),
// so every weekday/hour/month bucket must be derived in Europe/Vienna explicitly.

const TZ = 'Europe/Vienna'

// Monday-first, matching the roster/calendar week used across the app.
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

// Mon = 0 … Sun = 6
export const weekdayIndex = (date) => moment.tz(date, TZ).isoWeekday() - 1
export const hourOf = (date) => moment.tz(date, TZ).hour()
export const monthKey = (date) => moment.tz(date, TZ).format('YYYY-MM')

const rate = (numerator, denominator) =>
  denominator > 0 ? numerator / denominator : 0

// No-show / kept rates only make sense for appointments that already happened —
// a future planned appointment is neither. Cancellations can happen anytime, so
// those (and raw volume) count over the whole window.
const emptyMonth = (month) => ({
  month, total: 0, online: 0, internal: 0, canceled: 0, noShow: 0, kept: 0,
  // Online booking lead-time accumulator (for the monthly average lead time).
  leadSum: 0, leadCount: 0
})

// Pure aggregation over an appointment list. Exported for unit testing.
export const aggregate = (appointments = [], { now = new Date() } = {}) => {
  const isPast = (a) => a.start && new Date(a.start).getTime() < new Date(now).getTime()

  // Weekday × hour heatmap of expected (non-canceled) appointment volume.
  const matrix = WEEKDAYS.map(() => new Array(24).fill(0))
  appointments
    .filter(a => a.start && !isCanceled(a))
    .forEach(a => { matrix[weekdayIndex(a.start)][hourOf(a.start)] += 1 })

  // Monthly / seasonal time series.
  const monthsMap = {}
  appointments.forEach(a => {
    if (!a.start) { return }
    const key = monthKey(a.start)
    const m = (monthsMap[key] = monthsMap[key] || emptyMonth(key))
    m.total += 1
    if (isOnline(a)) {
      m.online += 1
      const ld = leadDaysOf(a)
      if (ld != null) { m.leadSum += ld; m.leadCount += 1 }
    } else { m.internal += 1 }
    if (isCanceled(a)) { m.canceled += 1 }
    if (isPast(a) && !isCanceled(a)) {
      if (isKept(a)) { m.kept += 1 } else { m.noShow += 1 }
    }
  })
  const months = Object.keys(monthsMap).sort().map(k => monthsMap[k])

  // Totals.
  const total = appointments.length
  const online = appointments.filter(isOnline).length
  const canceled = appointments.filter(isCanceled).length
  const priv = appointments.filter(isPrivate).length

  const pastExpected = appointments.filter(a => isPast(a) && !isCanceled(a))
  const noShow = pastExpected.filter(isNoShow).length
  const kept = pastExpected.filter(isKept).length

  // Exact-day lead-time distribution for online appointments (counts per day,
  // 0 … max), for the day-resolution lead-time line chart.
  const onlineAppointments = appointments.filter(isOnline)
  const leadValues = onlineAppointments.map(leadDaysOf).filter(d => d != null)
  const leadMax = leadValues.length ? Math.min(LEAD_CAP_DAYS, Math.max(...leadValues)) : 0
  const leadCounts = new Array(leadMax + 1).fill(0)
  leadValues.forEach(d => { leadCounts[Math.min(d, leadMax)] += 1 })

  return {
    total,
    online,
    internal: total - online,
    onlineShare: rate(online, total),

    insurance: total - priv,
    private: priv,

    canceled,
    expected: total - canceled,
    canceledRate: rate(canceled, total),

    noShow,
    kept,
    noShowRate: rate(noShow, pastExpected.length),

    // Weekday × hour matrix (Mon-first). matrix[weekday][hour] = count.
    heatmap: { weekdays: WEEKDAYS, matrix },

    // Seasonal time series, chronological.
    months,

    // Booking lead time (days in advance) for online appointments only.
    leadTime: histogram(onlineAppointments),

    // Exact-day lead-time counts (index = days in advance, value = count).
    leadDays: { max: leadMax, counts: leadCounts }
  }
}

// Same base filter as computeStatistics.fetchReal, plus optional doctor/tag
// filters. noShow is intentionally NOT fetched — the flag is not set in the DB;
// no-shows are computed from admittedAt/canceled (see statistics.isNoShow).
const REAL_FIELDS = {
  start: 1, end: 1, createdAt: 1, assigneeId: 1,
  privateAppointment: 1, createdViaPortal: 1,
  admittedAt: 1, canceled: 1, canceledAt: 1, patientId: 1, tags: 1
}

export const computePatientFlow = ({
  Appointments, Users,
  from, to, assigneeIds, tags,
  compareFrom, compareTo,
  now
}) => {
  const hiddenIds = Users.find({ hiddenInReports: true }, { fields: { _id: 1 } })
    .fetch().map(u => u._id)

  const fetchRange = (rangeFrom, rangeTo) => {
    const selector = {
      type: { $exists: false },
      patientId: { $exists: true, $ne: null },
      assigneeId: { $nin: hiddenIds },
      removed: { $ne: true },
      start: { $gte: rangeFrom, $lte: rangeTo }
    }
    if (assigneeIds && assigneeIds.length) {
      selector.assigneeId = { $in: assigneeIds, $nin: hiddenIds }
    }
    if (tags && tags.length) {
      selector.tags = { $in: tags }
    }
    return Appointments.find(selector, { fields: REAL_FIELDS }).fetch()
  }

  const compare = !!(compareFrom && compareTo)

  return {
    from,
    to,
    filters: { assigneeIds: assigneeIds || [], tags: tags || [] },
    current: aggregate(fetchRange(from, to), { now }),
    previous: compare ? aggregate(fetchRange(compareFrom, compareTo), { now }) : null,
    compare,
    compareFrom: compareFrom || null,
    compareTo: compareTo || null
  }
}
