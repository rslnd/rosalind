import groupBy from 'lodash/groupBy'
import sumBy from 'lodash/sumBy'

// A cancelation is recorded via canceledAt (SMS/manual). See appointments/schema.js.
export const isCanceled = a => !!(a.canceledAt || a.canceled)

// No-show = patient was booked but never checked in (admittedAt) and not canceled.
// Mirrors imports/api/reports/methods/mapNoShows.js `isNoShow`.
export const isNoShow = a => !a.admittedAt && !isCanceled(a)

// Kept = patient showed up (was checked in) and not canceled.
export const isKept = a => !!a.admittedAt && !isCanceled(a)

export const isOnline = a => a.createdViaPortal === true

// Private includes "halbprivat" (no dedicated flag exists — counted as private).
export const isPrivate = a => a.privateAppointment === true

const durationHours = (a) => {
  if (!a.start || !a.end) { return 0 }
  const ms = new Date(a.end).getTime() - new Date(a.start).getTime()
  if (!(ms > 0)) { return 0 }
  return ms / 1000 / 60 / 60
}

const ratio = (numerator, denominator) =>
  (denominator > 0 && numerator != null) ? numerator / denominator : null

// Computes all statistics for a single scope (whole practice or one doctor)
// over one time window.
//   appointments    real patient appointments (type unset, patientId set, not removed)
//   freeSlots       unbooked online-bookable slots (type: 'bookable', not removed)
//   scheduledHours  planned roster hours for this scope/window
//   slotsUsed/Available  calendar slot occupancy (columnsToAvailabilities) for the window
//   workingDays     number of working days in the window (for daily averages)
export const computeMetrics = ({
  appointments = [],
  freeSlots = 0,
  scheduledHours = null,
  slotsUsed = null,
  slotsAvailable = null,
  workingDays = null,
  splitBilling = true
}) => {
  const total = appointments.length
  const canceled = appointments.filter(isCanceled).length
  const expected = total - canceled
  const noShow = appointments.filter(isNoShow).length
  const admitted = appointments.filter(isKept).length

  const insurance = appointments.filter(a => !isPrivate(a)).length
  const priv = appointments.filter(isPrivate).length

  const online = appointments.filter(isOnline)
  const onlineCount = online.length
  const onlineExpected = online.filter(a => !isCanceled(a)).length
  const onlineNoShow = online.filter(isNoShow).length

  const bookedHours = sumBy(appointments.filter(a => !isCanceled(a)), durationHours)

  const metrics = {
    total,
    canceled,
    expected,
    admitted, // "eingehaltene" / kept appointments
    noShow,
    noShowRate: ratio(noShow, expected),

    insurance,
    private: priv,

    online: onlineCount,
    onlineNoShow,
    onlineNoShowRate: ratio(onlineNoShow, onlineExpected),

    // Utilization by time: booked appointment hours vs. planned roster hours
    bookedHours,
    scheduledHours,
    timeUtilization: ratio(bookedHours, scheduledHours),

    // Utilization by online-bookable slots (portal capacity only)
    freeSlots,
    slotUtilization: ratio(onlineCount, onlineCount + freeSlots),

    // Utilization by calendar slots (same slot logic as the calendar columns)
    slotsUsed,
    slotsAvailable,
    calendarSlotUtilization: ratio(slotsUsed, slotsAvailable),

    // Throughput
    patientsPerHour: ratio(admitted, scheduledHours),
    admittedPerDay: ratio(admitted, workingDays)
  }

  if (splitBilling) {
    metrics.billing = {
      insurance: computeMetrics({ appointments: appointments.filter(a => !isPrivate(a)), workingDays, splitBilling: false }),
      private: computeMetrics({ appointments: appointments.filter(isPrivate), workingDays, splitBilling: false })
    }
  }

  return metrics
}

const EINSCHUB = 'einschub'

// Groups appointments/slots by assigneeId and computes metrics per doctor + the
// practice total. Unassigned appointments become an "Einschub" row.
export const computeScope = ({
  appointments = [],
  freeSlots = [],
  scheduledHoursByUser = {},
  scheduledHoursTotal = null,
  slotStatsByUser = {},
  slotStatsTotal = {},
  workingDays = null
}) => {
  const apptsByAssignee = groupBy(appointments, a => a.assigneeId || EINSCHUB)
  const slotsByAssignee = groupBy(freeSlots, 'assigneeId')

  const assigneeIds = Object.keys(apptsByAssignee)
    .filter(id => id && id !== 'undefined' && id !== 'null' && id !== EINSCHUB)

  const assignees = assigneeIds.map(assigneeId => ({
    assigneeId,
    metrics: computeMetrics({
      appointments: apptsByAssignee[assigneeId] || [],
      freeSlots: (slotsByAssignee[assigneeId] || []).length,
      scheduledHours: scheduledHoursByUser[assigneeId] != null ? scheduledHoursByUser[assigneeId] : null,
      slotsUsed: slotStatsByUser[assigneeId] ? slotStatsByUser[assigneeId].slotsUsed : null,
      slotsAvailable: slotStatsByUser[assigneeId] ? slotStatsByUser[assigneeId].slotsAvailable : null,
      workingDays
    })
  }))

  // Einschub (unassigned appointments) — shown as its own row, like a doctor.
  if (apptsByAssignee[EINSCHUB] && apptsByAssignee[EINSCHUB].length) {
    assignees.push({
      assigneeId: null,
      type: EINSCHUB,
      metrics: computeMetrics({ appointments: apptsByAssignee[EINSCHUB], workingDays })
    })
  }

  const total = computeMetrics({
    appointments,
    freeSlots: freeSlots.length,
    scheduledHours: scheduledHoursTotal,
    slotsUsed: slotStatsTotal.slotsUsed != null ? slotStatsTotal.slotsUsed : null,
    slotsAvailable: slotStatsTotal.slotsAvailable != null ? slotStatsTotal.slotsAvailable : null,
    workingDays
  })

  return { total, assignees }
}
