import { Migrations } from 'meteor/percolate:migrations'
import { Reports } from '../../../api/reports'
import { dayToDate } from '../../../util/time/day'

Migrations.add({
  version: 6,

  up: async function () {
    const cursor = Reports.find({ day: { $ne: null } })

    for await (const report of cursor) {
      const date = dayToDate(report.day)

      await Reports.updateAsync({ _id: report._id }, {
        $set: {
          'day.date': date
        }
      })
    }

    console.log('Migration reportDate: added date to', await cursor.countAsync(), 'reports')

    return true
  },

  down: function () {
    return true
  }
})
