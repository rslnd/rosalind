import moment from 'moment-timezone'
import uniq from 'lodash/uniq'
import { rangeToDays, dateToDay } from '../../../util/time/day'
import { fullNameWithTitle } from '../../users/methods/name'
import { calculateScheduledHours } from '../../schedules/methods/getScheduledHours'
import { overridesToColumns } from '../../schedules/methods/overridesToColumns'
import { columnsToAvailabilities } from '../../schedules/methods/columnsToAvailabilities'
import { computeScope } from './statistics'
import { leadTimeDistribution, leadTimeDistributionByAssignee } from './leadTimeDistribution'

const WINDOW_DAYS = 30
const EARLIEST_YEAR = 2021
const CACHE_TTL_MS = 120 * 1000

const REAL_FIELDS = {
  start: 1, end: 1, createdAt: 1, assigneeId: 1,
  privateAppointment: 1, createdViaPortal: 1,
  admittedAt: 1, canceled: 1, canceledAt: 1, patientId: 1
}

// Short-lived cache so the interactive reload and the PDF/e-mail render (which
// recompute the very same day) don't pay the full cost twice.
const cache = new Map()
const cacheGet = (key) => {
  const hit = cache.get(key)
  if (hit && (Date.now() - hit.ts) < CACHE_TTL_MS) { return hit.value }
  if (hit) { cache.delete(key) }
  return null
}
const cacheSet = (key, value) => {
  cache.set(key, { ts: Date.now(), value })
  // prune stale entries
  for (const [k, v] of cache) {
    if ((Date.now() - v.ts) >= CACHE_TTL_MS) { cache.delete(k) }
  }
}

const dayKeyFromDate = (d) => {
  const m = moment(d)
  return `${m.year()}-${m.month() + 1}-${m.date()}`
}
const dayKeyFromDay = (day) => `${day.year}-${day.month}-${day.day}`

const pushInto = (map, key, value) => {
  if (!map[key]) { map[key] = [] }
  map[key].push(value)
}

export const computeStatistics = ({ Appointments, Schedules, Calendars, Users, Constraints, Tags, asOf }) => {
  const now = asOf ? moment(asOf) : moment()
  const cacheKey = dayKeyFromDay(dateToDay(now.toDate()))
  const cached = cacheGet(cacheKey)
  if (cached) { return cached }

  const hiddenIds = Users.find({ hiddenInReports: true }, { fields: { _id: 1 } })
    .fetch().map(u => u._id)
  const calendars = Calendars.find({}, { fields: { _id: 1, slotSize: 1, slotSizeAppointment: 1, scheduleOffset: 1, atMinutes: 1 } }).fetch()

  // Shared, window-independent prefetches (small collections, fetched once)
  const tags = Tags ? Tags.find({}).fetch() : []
  const constraintsByCalendar = {}
  if (Constraints) {
    Constraints.find({}).fetch().forEach(c => pushInto(constraintsByCalendar, c.calendarId, c))
  }
  const dayScheduleMap = {} // `${calendarId}|${dayKey}` -> daySchedule
  Schedules.find({ type: 'day' }, { fields: { calendarId: 1, day: 1, userIds: 1, removed: 1 } })
    .fetch().forEach(s => {
      if (!s.day) { return }
      const key = `${s.calendarId}|${dayKeyFromDay(s.day)}`
      if (!dayScheduleMap[key] || s.removed !== true) { dayScheduleMap[key] = s }
    })

  const fetchReal = ({ from, to }) => Appointments.find({
    type: { $exists: false },
    patientId: { $exists: true, $ne: null },
    assigneeId: { $nin: hiddenIds },
    removed: { $ne: true },
    start: { $gte: from, $lte: to }
  }, { fields: REAL_FIELDS }).fetch()

  const fetchFreeSlots = ({ from, to }) => Appointments.find({
    type: 'bookable',
    removed: { $ne: true },
    start: { $gte: from, $lte: to }
  }, { fields: { start: 1, end: 1, assigneeId: 1 } }).fetch()

  // Computes roster hours + calendar slot occupancy for a window using a few
  // batched queries instead of one query per (day, calendar, user).
  const computeUtilization = ({ from, to }) => {
    const days = rangeToDays({ from, to })

    const overrides = Schedules.find({
      type: 'override',
      start: { $gte: from, $lte: to }
    }, { fields: { userId: 1, calendarId: 1, start: 1, end: 1, note: 1, available: 1, roles: 1 } }).fetch()

    const allAppointments = Appointments.find({
      start: { $gte: from, $lte: to }
    }, { fields: { start: 1, end: 1, assigneeId: 1, calendarId: 1, type: 1 } }).fetch()

    const overridesByCalDay = {}
    const overridesByUserDay = {}
    overrides.forEach(o => {
      const k = dayKeyFromDate(o.start)
      pushInto(overridesByCalDay, `${o.calendarId}|${k}`, o)
      pushInto(overridesByUserDay, `${o.userId}|${k}`, o)
    })
    const apptsByCalDay = {}
    allAppointments.forEach(a => pushInto(apptsByCalDay, `${a.calendarId}|${dayKeyFromDate(a.start)}`, a))

    const scheduledByUser = {}
    let scheduledTotal = 0
    const slotByUser = {}
    let slotsUsedTotal = 0
    let slotsAvailableTotal = 0
    const countedHour = {} // `${dayKey}|${userId}` -> true

    days.forEach(day => {
      const dk = dayKeyFromDay(day)
      calendars.forEach(calendar => {
        const daySchedule = dayScheduleMap[`${calendar._id}|${dk}`]
        const assigneeIds = (daySchedule && daySchedule.userIds) || []
        if (assigneeIds.length === 0) { return }

        // Roster hours (getScheduledHours queries overrides per user/day, no calendar)
        assigneeIds
          .filter(userId => !hiddenIds.includes(userId))
          .forEach(userId => {
            const hk = `${dk}|${userId}`
            if (countedHour[hk]) { return }
            countedHour[hk] = true
            const hours = calculateScheduledHours({
              overrideSchedules: overridesByUserDay[`${userId}|${dk}`] || []
            })
            scheduledByUser[userId] = (scheduledByUser[userId] || 0) + hours
            scheduledTotal += hours
          })

        // Calendar slot occupancy (same logic as getColumns → columnsToAvailabilities)
        const columns = overridesToColumns({
          day,
          calendar,
          overrides: overridesByCalDay[`${calendar._id}|${dk}`] || [],
          constraints: constraintsByCalendar[calendar._id] || [],
          appointments: apptsByCalDay[`${calendar._id}|${dk}`] || [],
          tags
        })
        columnsToAvailabilities(columns).forEach(av => {
          const userId = av.assigneeId
          const used = av.slotsUsed || 0
          const available = av.slotsAvailable || 0
          if (userId && !hiddenIds.includes(userId)) {
            slotByUser[userId] = slotByUser[userId] || { slotsUsed: 0, slotsAvailable: 0 }
            slotByUser[userId].slotsUsed += used
            slotByUser[userId].slotsAvailable += available
          }
          slotsUsedTotal += used
          slotsAvailableTotal += available
        })
      })
    })

    return {
      scheduledByUser,
      scheduledTotal,
      slotByUser,
      slotStatsTotal: { slotsUsed: slotsUsedTotal, slotsAvailable: slotsAvailableTotal }
    }
  }

  const buildScope = ({ from, to, realAppts, withUtilization }) => {
    const workingDays = rangeToDays({ from, to }).length
    const util = withUtilization
      ? computeUtilization({ from, to })
      : { scheduledByUser: {}, scheduledTotal: null, slotByUser: {}, slotStatsTotal: {} }

    return {
      from,
      to,
      workingDays,
      ...computeScope({
        appointments: realAppts,
        freeSlots: fetchFreeSlots({ from, to }),
        scheduledHoursByUser: util.scheduledByUser,
        scheduledHoursTotal: util.scheduledTotal,
        slotStatsByUser: util.slotByUser,
        slotStatsTotal: util.slotStatsTotal,
        workingDays
      })
    }
  }

  const rangeOf = (endMoment) => ({
    from: endMoment.clone().subtract(WINDOW_DAYS, 'days').startOf('day').toDate(),
    to: endMoment.clone().endOf('day').toDate()
  })

  // One 30-day window per year (for KPIs + lead-time), fetched once each
  const yearsBack = Math.max(0, now.year() - EARLIEST_YEAR)
  const yearWindows = []
  for (let k = 0; k <= yearsBack; k++) {
    const end = now.clone().subtract(k, 'years')
    const range = rangeOf(end)
    yearWindows.push({ year: end.year(), ...range, realAppts: fetchReal(range) })
  }

  const current = buildScope({ ...yearWindows[0], withUtilization: true })
  const previous = yearWindows[1]
    ? buildScope({ ...yearWindows[1], withUtilization: true })
    : { from: null, to: null, total: null, assignees: [] }

  // Today (selected day) — appointment metrics only (no roster/slot cost)
  const todayRange = {
    from: now.clone().startOf('day').toDate(),
    to: now.clone().endOf('day').toDate()
  }
  const todayScope = computeScope({
    appointments: fetchReal(todayRange),
    freeSlots: fetchFreeSlots(todayRange),
    workingDays: 1
  })

  // Merge per-assignee current + previous-year figures under one row per doctor
  const nameFor = (usersById, ref) => {
    if (ref.type === 'einschub') { return 'Einschub' }
    return usersById[ref.assigneeId] ? fullNameWithTitle(usersById[ref.assigneeId]) : ref.assigneeId
  }

  const assigneeIds = uniq([
    ...current.assignees.filter(a => a.assigneeId).map(a => a.assigneeId),
    ...previous.assignees.filter(a => a.assigneeId).map(a => a.assigneeId)
  ])
  const usersById = {}
  Users.find({ _id: { $in: assigneeIds } }).fetch().forEach(u => { usersById[u._id] = u })

  const findEntry = (scope, ref) => scope.assignees.find(a =>
    ref.type === 'einschub' ? a.type === 'einschub' : a.assigneeId === ref.assigneeId
  )

  const keys = []
  const push = (a) => {
    const key = a.type === 'einschub' ? 'einschub' : a.assigneeId
    if (!keys.find(k => k.key === key)) { keys.push({ key, ref: a }) }
  }
  current.assignees.forEach(push)
  previous.assignees.forEach(push)

  const assignees = keys.map(({ ref }) => {
    const cur = findEntry(current, ref)
    const prev = findEntry(previous, ref)
    return {
      assigneeId: ref.assigneeId || null,
      type: ref.type || null,
      name: nameFor(usersById, ref),
      current: cur ? cur.metrics : null,
      previous: prev ? prev.metrics : null
    }
  }).sort((a, b) => {
    if (a.type === 'einschub') { return 1 }
    if (b.type === 'einschub') { return -1 }
    return a.name.localeCompare(b.name, 'de')
  })

  const yearWindowsForLeadTime = yearWindows.map(w => ({ year: w.year, appointments: w.realAppts }))

  const result = {
    asOf: now.toDate(),
    day: dateToDay(now.toDate()),
    windowDays: WINDOW_DAYS,
    today: { date: todayRange.from, total: todayScope.total },
    current: { from: current.from, to: current.to, workingDays: current.workingDays, total: current.total },
    previous: { from: previous.from, to: previous.to, total: previous.total },
    assignees,
    leadTime: {
      total: leadTimeDistribution({ yearWindows: yearWindowsForLeadTime }),
      byAssignee: leadTimeDistributionByAssignee({ yearWindows: yearWindowsForLeadTime })
    }
  }

  cacheSet(cacheKey, result)
  return result
}
