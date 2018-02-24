import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Reports } from '../../'
import { dayToDate } from '../../../../util/time/day'

export default () => {
  Migrations.add({
    version: 3,

    up: function () {
      const batch = Reports.rawCollection().initializeUnorderedBulkOp()
      let hasUpdates = false

      Reports.find({}).forEach(report => {
        hasUpdates = true

        const createdAt = dayToDate(report.day)

        const operation = {
          $set: {
            createdAt
          }
        }

        batch.find({ _id: report._id }).updateOne(operation)
      })

      if (hasUpdates) {
        const execute = Meteor.wrapAsync(batch.execute, batch)
        return execute()
      }

      return true
    },

    down: function () {
      const batch = Reports.rawCollection().initializeUnorderedBulkOp()
      let hasUpdates = false

      Reports.find({ createdAt: { $ne: null } }).forEach(patient => {
        hasUpdates = true

        const operation = {
          $unset: {
            createdAt: true
          }
        }

        batch.find({ _id: patient._id }).updateOne(operation)
      })

      if (hasUpdates) {
        const execute = Meteor.wrapAsync(batch.execute, batch)
        return execute()
      }

      return true
    }
  })
}
