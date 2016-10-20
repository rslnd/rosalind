import * as seeders from './seeders'
import { Meteor } from 'meteor/meteor'

export const seed = (collections) => {
  const userIds = Meteor.users.find().fetch().map((u) => u._id)

  Object.keys(collections).map((name) => {
    const collection = collections[name]
    console.log(`[Seed] Generating documents for collection ${name}`)
    seeders[name](collection, userIds)
  })
}
