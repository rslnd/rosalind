import moment from 'moment-timezone'
import uniq from 'lodash/uniq'
import { rangeToDays, dateToDay } from '../../../util/time/day'
import { fullNameWithTitle } from '../../users/methods/name'
import { calculateScheduledHours } from '../../schedules/methods/getScheduledHours'
import { computeScope, isOnline } from './statistics'
import { dayCounts } from './leadTimeDistribution'
import { headerSlots } from '../../schedules/methods/headerSlots'
import { dayStatus } from './dayFinished'

const CACHE_TTL_MS = 120 * 1000
// Cap for the exact-day lead time (same as the patient-flow analysis)
const LEAD_CAP_DAYS = 120

const REAL_FIELDS = {
  start: 1, end: 1, createdAt: 1, assigneeId: 1,
  privateAppointment: 1, createdViaPortal: 1,
  admittedAt: 1, canceled: 1, canceledAt: 1, patientId: 1,
  // Whether the day is finished (see dayFinished.js)
  calendarId: 1, noShow: 1, noShowAt: 1, dismissed: 1, dismissedAt: 1,
  treatmentStart: 1, treatmentEnd: 1
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

export const computeStatistics = async ({ Appointments, Schedules, Calendars, Users, asOf }) => {
  const now = asOf ? moment(asOf) : moment()
  const cacheKey = dayKeyFromDay(dateToDay(now.toDate()))
  const cached = cacheGet(cacheKey)
  if (cached) { return cached }

  const hiddenIds = (await Users.find({ hiddenInReports: true }, { fields: { _id: 1 } })
    .fetchAsync()).map(u => u._id)
  const calendars = await Calendars.find({}, { fields: { _id: 1, slotSize: 1, slotSizeAppointment: 1, scheduleOffset: 1, atMinutes: 1, admittedIsTreated: 1 } }).fetchAsync()

  // Shared, window-independent prefetch (small collection, fetched once)
  const dayScheduleMap = {} // `${calendarId}|${dayKey}` -> daySchedule
  ;(await Schedules.find({ type: 'day' }, { fields: { calendarId: 1, day: 1, userIds: 1, removed: 1 } })
    .fetchAsync()).forEach(s => {
      if (!s.day) { return }
      const key = `${s.calendarId}|${dayKeyFromDay(s.day)}`
      if (!dayScheduleMap[key] || s.removed !== true) { dayScheduleMap[key] = s }
    })

  const fetchReal = async ({ from, to }) => await Appointments.find({
    type: { $exists: false },
    patientId: { $exists: true, $ne: null },
    assigneeId: { $nin: hiddenIds },
    removed: { $ne: true },
    start: { $gte: from, $lte: to }
  }, { fields: REAL_FIELDS }).fetchAsync()

  const fetchFreeSlots = async ({ from, to }) => await Appointments.find({
    type: 'bookable',
    removed: { $ne: true },
    start: { $gte: from, $lte: to }
  }, { fields: { start: 1, end: 1, assigneeId: 1 } }).fetchAsync()

  // Computes roster hours + calendar slot occupancy for a window using a few
  // batched queries instead of one query per (day, calendar, user).
  const computeUtilization = async ({ from, to }) => {
    const days = rangeToDays({ from, to })

    const overrides = await Schedules.find({
      type: 'override',
      start: { $gte: from, $lte: to }
    }, { fields: { userId: 1, calendarId: 1, start: 1, end: 1, note: 1, available: 1, roles: 1 } }).fetchAsync()

    // Overrides + overlays, as the day view's column header counts slots with both
    const blockingSchedules = await Schedules.find({
      type: { $in: ['override', 'overlay'] },
      start: { $gte: from, $lte: to }
    }, { fields: { userId: 1, calendarId: 1, start: 1, end: 1, available: 1, roles: 1 } }).fetchAsync()

    const allAppointments = await Appointments.find({
      start: { $gte: from, $lte: to }
    }, { fields: { start: 1, end: 1, assigneeId: 1, calendarId: 1, type: 1 } }).fetchAsync()

    const overridesByUserDay = {}
    overrides.forEach(o => pushInto(overridesByUserDay, `${o.userId}|${dayKeyFromDate(o.start)}`, o))
    const schedulesByColumnDay = {}
    blockingSchedules.forEach(s => pushInto(schedulesByColumnDay, `${s.calendarId}|${s.userId}|${dayKeyFromDate(s.start)}`, s))
    const apptsByColumnDay = {}
    allAppointments.forEach(a => pushInto(apptsByColumnDay, `${a.calendarId}|${a.assigneeId}|${dayKeyFromDate(a.start)}`, a))

    const rosteredIds = uniq(Object.values(dayScheduleMap).flatMap(s => s.userIds || []))
    const assigneesById = {}
    ;(await Users.find({ _id: { $in: rosteredIds } }, { fields: { schedules: 1 } }).fetchAsync())
      .forEach(u => { assigneesById[u._id] = u })

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

        // Slot counts per doctor column, same as the day view's column header
        assigneeIds
          .filter(userId => !hiddenIds.includes(userId))
          .forEach(userId => {
            const columnKey = `${calendar._id}|${userId}|${dk}`
            const { slotsUsed, slotsAvailable } = headerSlots({
              day,
              calendar,
              assignee: assigneesById[userId],
              schedules: schedulesByColumnDay[columnKey] || [],
              appointments: apptsByColumnDay[columnKey] || []
            })
            slotByUser[userId] = slotByUser[userId] || { slotsUsed: 0, slotsAvailable: 0 }
            slotByUser[userId].slotsUsed += slotsUsed
            slotByUser[userId].slotsAvailable += slotsAvailable
            slotsUsedTotal += slotsUsed
            slotsAvailableTotal += slotsAvailable
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

  // Today (selected day)
  const todayRange = {
    from: now.clone().startOf('day').toDate(),
    to: now.clone().endOf('day').toDate()
  }
  const todayReal = await fetchReal(todayRange)
  const todayFreeSlots = await fetchFreeSlots(todayRange)

  // Roster hours + calendar-slot occupancy of the selected day, shared by the
  // retrospective day report and the forecast.
  const dayUtil = await computeUtilization(todayRange)

  // Retrospective day report (selected day is in the past).
  const current = computeScope({
    appointments: todayReal,
    freeSlots: todayFreeSlots,
    scheduledHoursByUser: dayUtil.scheduledByUser,
    scheduledHoursTotal: dayUtil.scheduledTotal,
    slotStatsByUser: dayUtil.slotByUser,
    slotStatsTotal: dayUtil.slotStatsTotal,
    workingDays: 1
  })

  // Lead time of the day's bookings (exact days in advance), split into online
  // vs. internally arranged.
  const leadTime = {
    series: [
      { label: 'Online', ...dayCounts(todayReal.filter(isOnline), LEAD_CAP_DAYS) },
      { label: 'Intern', ...dayCounts(todayReal.filter(a => !isOnline(a)), LEAD_CAP_DAYS) }
    ]
  }

  // Forecast (selected day is today or in the future): the same single day, but
  // with a row for every rostered doctor (present, even if nothing is booked yet).
  const forecastPresentIds = uniq([
    ...Object.keys(dayUtil.scheduledByUser),
    ...Object.keys(dayUtil.slotByUser)
  ])
  const forecastScope = computeScope({
    appointments: todayReal,
    freeSlots: todayFreeSlots,
    scheduledHoursByUser: dayUtil.scheduledByUser,
    scheduledHoursTotal: dayUtil.scheduledTotal,
    slotStatsByUser: dayUtil.slotByUser,
    slotStatsTotal: dayUtil.slotStatsTotal,
    workingDays: 1,
    presentUserIds: forecastPresentIds
  })

  const forecastUserIds = forecastScope.assignees.filter(a => a.assigneeId).map(a => a.assigneeId)
  const forecastUsersById = {}
  ;(await Users.find({ _id: { $in: forecastUserIds } }).fetchAsync()).forEach(u => { forecastUsersById[u._id] = u })

  const forecastAssignees = forecastScope.assignees.map(a => ({
    assigneeId: a.assigneeId || null,
    type: a.type || null,
    name: a.type === 'einschub'
      ? 'Einschub'
      : (forecastUsersById[a.assigneeId] ? fullNameWithTitle(forecastUsersById[a.assigneeId]) : a.assigneeId),
    metrics: a.metrics
  })).sort((a, b) => {
    if (a.type === 'einschub') { return 1 }
    if (b.type === 'einschub') { return -1 }
    return a.name.localeCompare(b.name, 'de')
  })

  const einschubRow = forecastScope.assignees.find(a => a.type === 'einschub')

  const forecast = {
    date: todayRange.from,
    total: forecastScope.total,
    einschub: einschubRow ? einschubRow.metrics.total : 0,
    assignees: forecastAssignees,
    leadTime
  }

  const assigneeIds = current.assignees.filter(a => a.assigneeId).map(a => a.assigneeId)
  const usersById = {}
  ;(await Users.find({ _id: { $in: assigneeIds } }).fetchAsync()).forEach(u => { usersById[u._id] = u })

  const assignees = current.assignees.map(a => ({
    assigneeId: a.assigneeId || null,
    type: a.type || null,
    name: a.type === 'einschub'
      ? 'Einschub'
      : (usersById[a.assigneeId] ? fullNameWithTitle(usersById[a.assigneeId]) : a.assigneeId),
    current: a.metrics
  })).sort((a, b) => {
    if (a.type === 'einschub') { return 1 }
    if (b.type === 'einschub') { return -1 }
    return a.name.localeCompare(b.name, 'de')
  })

  // Today's report stays a forecast until everybody is processed (or 22:00)
  const day = dateToDay(now.toDate())
  const calendarsById = {}
  calendars.forEach(c => { calendarsById[c._id] = c })
  const status = dayStatus({ appointments: todayReal, calendarsById, day })

  const result = {
    asOf: now.toDate(),
    day,
    dayFinished: status.finished,
    finishedAt: status.finishedAt,
    finishedReason: status.reason,
    forecast,
    current: { from: todayRange.from, to: todayRange.to, total: current.total },
    assignees,
    leadTime
  }

  cacheSet(cacheKey, result)
  return result
}
