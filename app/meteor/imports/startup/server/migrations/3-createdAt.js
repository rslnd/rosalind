import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Reports } from '../../../api/reports'
import { dayToDate } from '../../../util/time/day'

Migrations.add({
  version: 3,

  up: async function () {
    const batch = Reports.rawCollection().initializeUnorderedBulkOp()
    let hasUpdates = false

    await Reports.find({}).forEachAsync(report => {
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
      return await batch.execute()
    }

    return true
  },

  down: async function () {
    const batch = Reports.rawCollection().initializeUnorderedBulkOp()
    let hasUpdates = false

    await Reports.find({ createdAt: { $ne: null } }).forEachAsync(patient => {
      hasUpdates = true

      const operation = {
        $unset: {
          createdAt: true
        }
      }

      batch.find({ _id: patient._id }).updateOne(operation)
    })

    if (hasUpdates) {
      return await batch.execute()
    }

    return true
  }
})
