import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

const Events = new Mongo.Collection('events')

if (Meteor.isServer) {
  Events._createCappedCollection(1024 * 1024 * 4)
}

Events.attachSchema(Schema)
Events.methods = methods({ Events })

// Shortcut method
Events.post = (type, payload, level = 'info') =>
  Events.methods.post.call({ type, payload, level })

export default Events
