import idx from 'idx'
import { Migrations } from 'meteor/percolate:migrations'
import { Schedules } from '../../../api/schedules'
import { Calendars } from '../../../api/calendars'
import { Availabilities } from '../../../api/availabilities'
import { dayToDate, rangeToDays } from '../../../util/time/day'

Meteor.startup(() => {
  console.log('Simulating migration')
  console.log('Removing all Availabilities')
  Availabilities.remove({})

  Calendars.find({}).fetch().map(calendar => {
    const calendarId = calendar._id
    console.log('Calendar', calendarId)

    const overrideDate = sort =>
      idx(Schedules.find({
        type: 'override',
        calendarId
      }, {
        sort: {
          start: sort === 'earliest' ? 1 : -1
        },
        limit: 1
      }).fetch()[0], _ => _.start)

    const cutoffDate = dayToDate({
      year: 2018,
      month: 11,
      day: 19
    })

    const days = rangeToDays({
      from: cutoffDate || overrideDate('earliest'), // TODO: Remove debugging
      to: overrideDate('latest') || cutoffDate
    })

    days.map(day => {
      const columns = Schedules.methods.getColumns({ calendarId, day })
      const availabilities = Schedules.methods.columnsToAvailabilities(columns)

      try {
        availabilities.map(a => Availabilities.insert(a))
      } catch (e) {
        console.error(e)
        console.log('From', columns.length, 'Columns')
        console.log('To', availabilities.length, 'Availabilities:', availabilities)
      }
    })
  })

  console.log('Done')
})

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
