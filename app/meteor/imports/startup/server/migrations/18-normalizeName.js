import pick from 'lodash/pick'
import fromPairs from 'lodash/fromPairs'
import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'
import { normalizeName } from '../../../api/patients/util/normalizeName'

Migrations.add({
  version: 18,

  up: async function () {
    const batch = Patients.rawCollection().initializeUnorderedBulkOp()
    let count = 0

    await Patients.find({}).forEachAsync(patient => {
      const operation = {
        $set: {
          lastNameNormalized: normalizeName(patient.lastName),
          firstNameNormalized: normalizeName(patient.firstName)
        }
      }

      batch.find({ _id: patient._id }).updateOne(operation)
      count++
    })

    if (count > 0) {
      await batch.execute()
    }

    return true
  },

  down: function () {
    return true
  }
})

