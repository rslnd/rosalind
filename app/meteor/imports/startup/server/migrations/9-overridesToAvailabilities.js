import idx from 'idx'
import moment from 'moment-timezone'
// import { Migrations } from 'meteor/percolate:migrations'
import { Meteor } from 'meteor/meteor'
import { Schedules } from '../../../api/schedules'
import { Calendars } from '../../../api/calendars'
import { Availabilities } from '../../../api/availabilities'
import { dayToDate, rangeToDays } from '../../../util/time/day'

const migrateUp = async () => {
  // TODO: Do properly. Only do this hack on one machine, otherwise
  // we end up with more or less duplicated availabilities
  if (process.env.PROCESS_JOBS !== '1') {
    return
  }

  console.log('Simulating migration')
  console.log('Removing all Availabilities')
  await Availabilities.removeAsync({})

  ;await Promise.all((await Calendars.find({}).fetchAsync()).map(async calendar => {
    const calendarId = calendar._id
    console.log('Calendar', calendarId)

    const overrideDate = async sort =>
      idx((await Schedules.find({
        type: 'override',
        calendarId
      }, {
        sort: {
          start: sort === 'earliest' ? 1 : -1
        },
        limit: 1
      }).fetchAsync())[0], _ => _.start)

    const cutoffDate = new Date()

    const days = rangeToDays({
      from: cutoffDate || await overrideDate('earliest'), // TODO: Remove debugging
      to: await overrideDate('latest') || cutoffDate
    })

    await Promise.all(days.map(async day => {
      const columns = await Schedules.methods.getColumns({ calendarId, day })
      const availabilities = Schedules.methods.columnsToAvailabilities(columns)

      try {
        await Promise.all(availabilities.map(async a => await Availabilities.insertAsync(a)))
      } catch (e) {
        console.error(e)
        console.log('From', columns.length, 'Columns')
        console.log('To', availabilities.length, 'Availabilities:', availabilities)
      }
    }))
  }))

  console.log('Done')
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
