import pick from 'lodash/pick'
import fromPairs from 'lodash/fromPairs'
import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Users } from '../../'

const profileFields = [
  'firstName',
  'lastName',
  'titlePrepend',
  'titleAppend',
  'birthday',
  'gender',
  'employee',
  'group'
]

export default () => {
  Migrations.add({
    version: 2,

    up: function () {
      const batch = Users.rawCollection().initializeUnorderedBulkOp()
      let hasUpdates = false

      const selector = {
        profile: { $ne: null }
      }

      Users.find(selector).forEach(user => {
        hasUpdates = true

        const newFields = pick(user.profile, profileFields)

        const operation = {
          $set: {
            ...newFields
          },
          $unset: {
            profile: true
          }
        }

        batch.find({ _id: user._id }).updateOne(operation)
      })

      if (hasUpdates) {
        const execute = Meteor.wrapAsync(batch.execute, batch)
        return execute()
      }

      return true
    },

    down: function () {
      const batch = Users.rawCollection().initializeUnorderedBulkOp()
      let hasUpdates = false

      const selector = {
        profile: null,
        lastName: { $ne: null }
      }

      const unset = fromPairs(profileFields.map(k => [k, 1]))

      Users.find(selector).forEach(user => {
        hasUpdates = true

        const newFields = pick(user, profileFields)

        const operation = {
          $set: {
            profile: newFields
          },
          $unset: unset
        }

        batch.find({ _id: user._id }).updateOne(operation)
      })

      if (hasUpdates) {
        const execute = Meteor.wrapAsync(batch.execute, batch)
        return execute()
      }

      return true
    }
  })
}
