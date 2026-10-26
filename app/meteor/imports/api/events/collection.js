import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

const Events = new Mongo.Collection('events')

if (Meteor.isServer) {
  Meteor.startup(async () => {
    const db = Meteor.users.rawDatabase()
    const collectionExists = await db.listCollections({ name: 'events' }).hasNext()
    if (!collectionExists) {
      await db.createCollection('events', { capped: true, size: 1024 * 1024 * 4 })
    }
  })
}

Events.attachSchema(Schema)
Events.methods = methods({ Events })

// Shortcut method. Returns a promise; most callers use it fire-and-forget.
Events.post = (type, payload, level = 'info') =>
  Events.methods.post.callPromise({ type, payload, level })

export default Events
