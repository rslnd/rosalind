import pick from 'lodash/pick'
import fromPairs from 'lodash/fromPairs'
import { Meteor } from 'meteor/meteor'
import { Migrations } from 'meteor/percolate:migrations'
import { Users } from '../../../api/users'

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

Migrations.add({
  version: 2,

  up: async function () {
    const batch = Users.rawCollection().initializeUnorderedBulkOp()
    let hasUpdates = false

    const selector = {
      profile: { $ne: null }
    }

    await Users.find(selector).forEachAsync(user => {
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
      return await batch.execute()
    }

    return true
  },

  down: async function () {
    const batch = Users.rawCollection().initializeUnorderedBulkOp()
    let hasUpdates = false

    const selector = {
      profile: null,
      lastName: { $ne: null }
    }

    const unset = fromPairs(profileFields.map(k => [k, 1]))

    await Users.find(selector).forEachAsync(user => {
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
      return await batch.execute()
    }

    return true
  }
})
