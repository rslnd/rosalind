import { Migrations } from 'meteor/percolate:migrations'
import { Reports } from '../../../api/reports'
import { dayToDate } from '../../../util/time/day'

Migrations.add({
  version: 6,

  up: function () {
    const cursor = Reports.find({ day: { $ne: null } })

    cursor.forEach(report => {
      const date = dayToDate(report.day)

      Reports.update({ _id: report._id }, {
        $set: {
          'day.date': date
        }
      })
    })

    console.log('Migration reportDate: added date to', cursor.count(), 'reports')

    return true
  },

  down: function () {
    return true
  }
})
