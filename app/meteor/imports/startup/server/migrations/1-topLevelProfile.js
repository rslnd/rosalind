import pick from 'lodash/pick'
import fromPairs from 'lodash/fromPairs'
import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Patients } from '../../../api/patients'

const profileFields = [
  'contacts',
  'address',
  'firstName',
  'lastName',
  'lastNameNormalized',
  'titlePrepend',
  'titleAppend',
  'birthday',
  'gender',
  'noSMS',
  'noCall',
  'banned'
]

Migrations.add({
  version: 1,

  up: function () {
    const batch = Patients.rawCollection().initializeUnorderedBulkOp()
    let hasUpdates = false

    const selector = {
      profile: { $ne: null }
    }

    Patients.find(selector).forEach(patient => {
      hasUpdates = true

      const newFields = pick(patient.profile, profileFields)

      const operation = {
        $set: {
          ...newFields
        },
        $unset: {
          profile: true
        }
      }

      batch.find({ _id: patient._id }).updateOne(operation)
    })

    if (hasUpdates) {
      const execute = Meteor.wrapAsync(batch.execute, batch)
      return execute()
    }

    return true
  },

  down: function () {
    const batch = Patients.rawCollection().initializeUnorderedBulkOp()
    let hasUpdates = false

    const selector = {
      profile: null,
      lastName: { $ne: null }
    }

    const unset = fromPairs(profileFields.map(k => [k, 1]))

    Patients.find(selector).forEach(patient => {
      hasUpdates = true

      const newFields = pick(patient, profileFields)

      const operation = {
        $set: {
          profile: newFields
        },
        $unset: unset
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
