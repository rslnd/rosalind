import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

const Events = new Mongo.Collection('events')

if (Meteor.isServer) {
  const db = Meteor.users.rawDatabase()
  const collectionExists = db.listCollections({ name: 'events' }).hasNext().await()
  if (!collectionExists) {
    db.createCollection('events', { capped: true, size: 1024 * 1024 * 4 }).await()
  }
}

Events.attachSchema(Schema)
Events.methods = methods({ Events })

// Shortcut method
Events.post = (type, payload, level = 'info') =>
  Events.methods.post.call({ type, payload, level })

export default Events
