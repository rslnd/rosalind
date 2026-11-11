import moment from 'moment-timezone'
// import { Migrations } from 'meteor/percolate:migrations'
import { Meteor } from 'meteor/meteor'
import { Schedules } from '../../../api/schedules'
import { Calendars } from '../../../api/calendars'
import { Appointments } from '../../../api/appointments'
import { Users } from '../../../api/users'
import { Availabilities } from '../../../api/availabilities'
import { PRACTICE_TZ, rangeToDaysInTz } from '../../../util/time/day'
import { headerAvailabilities } from '../../../api/schedules/methods/headerSlots'

const dayKeyOf = date => moment.tz(date, PRACTICE_TZ).format('YYYY-M-D')
const dayKey = day => [day.year, day.month, day.day].join('-')

const groupBy = (list, keyOf) => list.reduce((acc, item) => {
  const key = keyOf(item)
  acc[key] = acc[key] || []
  acc[key].push(item)
  return acc
}, {})

// Recomputes the upcoming Availabilities (shown in the help drawer) with the
// same slot counting as the day view's column header (headerSlots).
const migrateUp = async () => {
  // TODO: Do properly. Only do this hack on one machine, otherwise
  // we end up with more or less duplicated availabilities
  if (process.env.PROCESS_JOBS !== '1') {
    return
  }

  console.log('[overridesToAvailabilities] Removing all Availabilities')
  await Availabilities.removeAsync({})

  const from = moment.tz(PRACTICE_TZ).startOf('day').toDate()

  for (const calendar of await Calendars.find({}).fetchAsync()) {
    const calendarId = calendar._id

    const schedules = await Schedules.find({
      calendarId,
      type: { $in: ['override', 'overlay'] },
      start: { $gte: from }
    }, { fields: { userId: 1, start: 1, end: 1, available: 1, roles: 1 } }).fetchAsync()
    if (schedules.length === 0) { continue }

    const daySchedules = await Schedules.find({ calendarId, type: 'day' },
      { fields: { day: 1, userIds: 1 } }).fetchAsync()
    const userIdsByDay = {}
    daySchedules.forEach(s => { if (s.day) { userIdsByDay[dayKey(s.day)] = s.userIds || [] } })

    const appointments = await Appointments.find({
      calendarId,
      start: { $gte: from }
    }, { fields: { assigneeId: 1, start: 1, end: 1, type: 1 } }).fetchAsync()

    const schedulesByColumnDay = groupBy(schedules, s => `${s.userId}|${dayKeyOf(s.start)}`)
    const appointmentsByColumnDay = groupBy(appointments, a => `${a.assigneeId}|${dayKeyOf(a.start)}`)

    const userIds = [...new Set(Object.values(userIdsByDay).flat())]
    const usersById = {}
    ;(await Users.find({ _id: { $in: userIds } }, { fields: { schedules: 1 } }).fetchAsync())
      .forEach(u => { usersById[u._id] = u })

    const to = new Date(Math.max(...schedules.map(s => s.start.getTime())))
    const days = rangeToDaysInTz({ from, to })

    let inserted = 0
    for (const day of days) {
      for (const assigneeId of (userIdsByDay[dayKey(day)] || [])) {
        const columnKey = `${assigneeId}|${dayKey(day)}`
        const availabilities = headerAvailabilities({
          day,
          calendar,
          assignee: usersById[assigneeId],
          schedules: schedulesByColumnDay[columnKey] || [],
          appointments: appointmentsByColumnDay[columnKey] || []
        })

        for (const availability of availabilities) {
          try {
            await Availabilities.insertAsync({ ...availability, calendarId, assigneeId })
            inserted++
          } catch (e) {
            console.error('[overridesToAvailabilities] Failed to insert', availability, e)
          }
        }
      }
    }

    console.log('[overridesToAvailabilities] Calendar', calendarId, inserted, 'Availabilities')
  }

  console.log('[overridesToAvailabilities] Done')
}

Meteor.startup(migrateUp)

const nextMidnightInMs = moment().add(1, 'day').startOf('day').diff(moment(), 'milliseconds')

const runMigrateUp = () => migrateUp().catch(e => console.error('[overridesToAvailabilities] Failed', e))

Meteor.setTimeout(() => {
  runMigrateUp()
  Meteor.setInterval(runMigrateUp, 1000 * 86400)
}, nextMidnightInMs)


// TODO: Run as migration
// Migrations.add({
//   version: 8,

//   up: function () {
//     return true
//   },

//   down: function () {
//     return true
//   }
// })
