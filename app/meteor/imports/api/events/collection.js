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
//
// Server only, and deliberately so. Every caller sits inside a method body, so
// on the client this runs inside that method's stub. Starting a nested method
// call from a stub and not awaiting it corrupts DDP._CurrentMethodInvocation:
// the nested stub captures the parent's invocation on entry and restores it
// when its own promise settles, which happens *after* the parent stub has
// already restored the outer (null) context. The connection is then stuck
// believing it is permanently inside a simulation, and from that moment on
// _apply() short-circuits every method call and sends nothing to the server --
// writes silently do nothing and the server logs never show the call at all.
//
// The event log is server-side state anyway: there is nothing for a simulation
// to predict, so there is no optimistic update to lose by skipping it.
//
// The event log is also an audit trail, not part of any action's contract: a
// failure to record an event must never reject into (and thereby abort) the
// action that posted it, nor surface as an unhandled rejection.
Events.post = (type, payload, level = 'info') => {
  if (!Meteor.isServer) { return Promise.resolve() }

  return Events.methods.post.callPromise({ type, payload, level })
    .catch(e => { console.error('[Events] Failed to post event', type, e) })
}

export default Events
