import moment from 'moment-timezone'
import idx from 'idx'
import uniq from 'lodash/uniq'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { withTracker } from '../../components/withTracker'
import { Calendars } from '../../../api/calendars'
import { Schedules } from '../../../api/schedules'
import { Appointments } from '../../../api/appointments'
import { Users } from '../../../api/users'
import { subscribe } from '../../../util/meteor/subscribe'
import { dateToDay, dayToString, isSame } from '../../../util/time/day'
import { transformDefaultsToOverrides } from '../../../api/schedules/methods/transformDefaultsToOverrides'
import { calculateScheduledHours } from '../../../api/schedules/methods/getScheduledHours'
import { MonthView } from './MonthView'

const minutesBetween = (start, end) => Math.max(0, (end.getTime() - start.getTime()) / 60000)

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart

const composer = (props) => {
  // Works both embedded (props.calendarSlug / props.dateStr) and, as a fallback,
  // from route params.
  const calendarSlug = props.calendarSlug || idx(props, _ => _.match.params.calendar)
  const dateParam = props.dateStr || idx(props, _ => _.match.params.date)
  const calendar = Calendars.findOne({ slug: calendarSlug })
  if (!calendar) { return { isLoading: true } }
  const calendarId = calendar._id

  const monthMoment = (dateParam ? moment(dateParam) : moment()).startOf('month')
  const year = monthMoment.year()
  const month = monthMoment.month() + 1 // 1-indexed, matches publication

  const schedulesSub = subscribe('schedules-month', { year, month, calendarId })
  const appointmentsSub = subscribe('appointments-month', { year, month, calendarId })
  subscribe('schedules-default')
  subscribe('schedules-vacations', { calendarId })

  const monthStart = monthMoment.clone().startOf('month')
  const monthEnd = monthMoment.clone().endOf('month')

  // All calendar-days of the month.
  const days = []
  const cursor = monthStart.clone()
  while (cursor.isSameOrBefore(monthEnd, 'day')) {
    days.push(dateToDay(cursor.toDate()))
    cursor.add(1, 'day')
  }

  const overrides = Schedules.find({
    calendarId,
    type: { $in: ['override', 'overlay'] },
    start: { $lte: monthEnd.toDate() },
    end: { $gte: monthStart.toDate() },
    removed: { $ne: true }
  }).fetch()

  const daySchedules = Schedules.find({
    calendarId,
    type: 'day',
    'day.year': year,
    'day.month': month,
    removed: { $ne: true }
  }).fetch()

  const vacations = Schedules.find({
    calendarId,
    type: 'vacation',
    start: { $lte: monthEnd.toDate() },
    end: { $gte: monthStart.toDate() },
    removed: { $ne: true }
  }).fetch()

  // All vacations of the calendar (recent + future) for highlighting in the
  // vacation date picker.
  const allVacations = Schedules.find({
    calendarId,
    type: 'vacation',
    removed: { $ne: true }
  }).fetch()

  const holidays = Schedules.find({
    type: 'holiday',
    start: { $lte: monthEnd.toDate() },
    end: { $gte: monthStart.toDate() },
    removed: { $ne: true }
  }).fetch()

  const appointments = Appointments.find({
    calendarId,
    start: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
    removed: { $ne: true }
  }).fetch()

  const defaultSchedules = Schedules.find({
    type: 'default',
    calendarId,
    removed: { $ne: true }
  }).fetch()

  // Abbreviated names are only used inside the month grid cells; the vacation /
  // absence UI and warnings use the full name.
  const nameShort = userId => {
    const u = Users.findOne({ _id: userId })
    return u ? Users.methods.abbreviatedNameWithTitle(u) : userId
  }
  const nameFull = userId => {
    const u = Users.findOne({ _id: userId })
    return u ? Users.methods.fullNameWithTitle(u) : userId
  }

  // Expected overrides from the standard week (to detect deviations).
  const expected = transformDefaultsToOverrides({ defaultSchedules, days })
  const expectedOverridesByDayUser = {}
  expected.filter(o => o.type === 'override').forEach(o => {
    const key = dayToString(dateToDay(o.start)) + '/' + o.userId
    expectedOverridesByDayUser[key] = expectedOverridesByDayUser[key] || []
    expectedOverridesByDayUser[key].push(o)
  })

  const dayData = days.map(day => {
    const dayStr = dayToString(day)
    const dStart = moment(day.year + '-' + day.month + '-' + day.day, 'YYYY-M-D').startOf('day').toDate()
    const dEnd = moment(day.year + '-' + day.month + '-' + day.day, 'YYYY-M-D').endOf('day').toDate()

    const ds = daySchedules.find(d => dayToString(d.day) === dayStr)
    const attendeeIds = (ds && ds.userIds) || []
    const note = ds && ds.note

    // Match holidays by their `day` field (timezone-safe); fall back to the
    // start/end overlap only for legacy holidays without a day.
    const holiday = holidays.find(h =>
      h.day ? isSame(h.day, day) : overlaps(h.start, h.end, dStart, dEnd))
    const dayVacations = vacations.filter(v => overlaps(v.start, v.end, dStart, dEnd))

    const dayOverrides = overrides.filter(o => overlaps(o.start, o.end, dStart, dEnd))
    const dayAppointments = appointments.filter(a => overlaps(a.start, a.end, dStart, dEnd))

    // Utilization: booked (non-bookable) minutes vs available minutes.
    let availableMinutes = 0
    attendeeIds.forEach(uid => {
      const userOverrides = dayOverrides.filter(o => o.type === 'override' && o.available === false && o.userId === uid)
      availableMinutes += calculateScheduledHours({ overrideSchedules: userOverrides }) * 60
    })
    const realAppointments = dayAppointments.filter(a => a.type !== 'bookable' && !a.canceled)
    const bookedMinutes = realAppointments
      .reduce((sum, a) => sum + minutesBetween(a.start, a.end), 0)
    const utilization = availableMinutes > 0 ? Math.min(1, bookedMinutes / availableMinutes) : null
    const appointmentCount = realAppointments.length

    // Deviation from the standard week: compare scheduled hours per attendee.
    let deviation = false
    attendeeIds.forEach(uid => {
      const actual = calculateScheduledHours({
        overrideSchedules: dayOverrides.filter(o => o.type === 'override' && o.available === false && o.userId === uid)
      })
      const exp = expectedOverridesByDayUser[dayStr + '/' + uid] || []
      const expectedHours = calculateScheduledHours({ overrideSchedules: exp })
      if (Math.abs(actual - expectedHours) > 0.1) { deviation = true }
    })

    // Warnings – as precise as possible (who, when, why).
    const warnings = []
    const dateLabel = moment(dStart).format('dd DD.MM.')
    const timeRange = a => `${moment(a.start).format('HH:mm')}–${moment(a.end).format('HH:mm')}`

    // Appointments that fall within a vacation, grouped per assignee so we can
    // report the total count ("obwohl Urlaub eingetragen ist, sind noch N
    // Termine vergeben").
    const vacationHits = {} // assigneeId -> { vac, appts: [] }

    dayAppointments.forEach(a => {
      if (a.type === 'bookable') {
        // Online bookable slot while the doctor is not present that day.
        const absent = !attendeeIds.includes(a.assigneeId)
        const blocked = dayOverrides.some(o =>
          o.type === 'override' && o.available === false && o.userId === a.assigneeId &&
          overlaps(o.start, o.end, a.start, a.end)
        )
        if (a.assigneeId && (absent || blocked)) {
          const reasonTxt = absent
            ? `nicht als anwesend eingeplant`
            : `zu dieser Zeit als abwesend/blockiert eingetragen`
          warnings.push({
            type: 'bookableWhileAbsent',
            message: `${dateLabel}: Online buchbarer Slot ${timeRange(a)} für ${nameFull(a.assigneeId)}, obwohl ${nameFull(a.assigneeId)} ${reasonTxt} ist. Patient:innen könnten einen Termin buchen, der nicht wahrgenommen werden kann.`
          })
        }
      } else if (!a.canceled && a.assigneeId) {
        // Appointment during a vacation.
        const vac = dayVacations.find(v => v.userId === a.assigneeId && (
          v.allDay || (v.from && v.to && overlaps(v.start, v.end, a.start, a.end) && overlapsHM(v, a))
        ))
        if (vac) {
          vacationHits[a.assigneeId] = vacationHits[a.assigneeId] || { vac, appts: [] }
          vacationHits[a.assigneeId].appts.push(a)
        }
      }
    })

    Object.keys(vacationHits).forEach(assigneeId => {
      const { appts } = vacationHits[assigneeId]
      const n = appts.length
      warnings.push({
        type: 'appointmentDuringVacation',
        message: `${dateLabel}: Urlaub für ${nameFull(assigneeId)} eingetragen, ${n} ${n === 1 ? 'Termin' : 'Termine'} vergeben.`
      })
    })

    // Practice marked closed but appointments already exist.
    if (holiday && appointmentCount > 0) {
      const t = appointmentCount === 1 ? 'ist noch 1 Termin' : `sind noch ${appointmentCount} Termine`
      warnings.push({
        type: 'closedWithAppointments',
        message: `${dateLabel}: Praxis ist als geschlossen markiert, es ${t} vereinbart. Bitte verschieben oder absagen.`
      })
    }

    return {
      day,
      dayStr,
      date: dStart,
      isSunday: moment(dStart).isoWeekday() === 7,
      attendees: attendeeIds.map(uid => ({ _id: uid, name: nameShort(uid) })),
      note,
      holiday,
      vacations: dayVacations.map(v => ({ ...v, userName: nameShort(v.userId) })),
      utilization,
      bookedMinutes,
      availableMinutes,
      appointmentCount,
      hasAppointments: appointmentCount > 0,
      deviation,
      warnings
    }
  })

  // Staff that can take a vacation for this calendar: everyone planned in the
  // standard week or scheduled this month.
  const staffIds = uniq([
    ...defaultSchedules.map(d => d.userId),
    ...daySchedules.reduce((acc, ds) => acc.concat(ds.userIds || []), [])
  ].filter(Boolean))
  const staff = staffIds
    .map(id => Users.findOne({ _id: id }))
    .filter(Boolean)
    .map(u => ({ _id: u._id, name: Users.methods.fullNameWithTitle(u) }))

  const onSaveVacation = ({ scheduleId, userId, start, end, allDay, from, to, reason }) =>
    Schedules.actions.upsertVacation.callPromise({
      scheduleId, calendarId, userId, start, end, allDay, from, to, reason
    }).then(() => Alert.success(__('ui.saved')))
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })

  const onRemoveVacation = (scheduleId) =>
    Schedules.actions.softRemove.callPromise({ scheduleId })
      .then(() => Alert.success(__('ui.deleted')))
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })

  const onSetDayClosed = (day, closed) =>
    Schedules.actions.setDayClosed.callPromise({ day, closed })
      .then(() => Alert.success(__('ui.saved')))
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })

  return {
    calendar,
    monthMoment,
    dayData,
    staff,
    existingVacations: allVacations,
    isReady: schedulesSub.ready() && appointmentsSub.ready(),
    basePath: 'appointments/month',
    // pass-through for embedded/overlay usage
    embedded: props.embedded,
    onClose: props.onClose,
    onSelectDay: props.onSelectDay,
    onChangeMonth: props.onChangeMonth,
    onSaveVacation,
    onRemoveVacation,
    onSetDayClosed
  }
}

// Whether a partial-day vacation's time window overlaps an appointment (by HM).
const overlapsHM = (vacation, appointment) => {
  if (!vacation.from || !vacation.to) { return true }
  const toMin = hm => hm.h * 60 + (hm.m || 0)
  const apptStart = moment(appointment.start)
  const apptEnd = moment(appointment.end)
  const aStart = apptStart.hours() * 60 + apptStart.minutes()
  const aEnd = apptEnd.hours() * 60 + apptEnd.minutes()
  return aStart < toMin(vacation.to) && aEnd > toMin(vacation.from)
}

export const MonthViewContainer = withTracker(composer)(MonthView)
