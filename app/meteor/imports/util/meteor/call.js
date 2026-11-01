import { Meteor } from 'meteor/meteor'
import { isInSimulation } from './isInSimulation'

// Meteor 3-safe replacement for Meteor.call on the client.
//
// Meteor.call routes through the synchronous connection.apply(), which does not
// await the method's stub. Every stub here is async (and any stub that writes to
// minimongo becomes async implicitly, because collection.insertAsync is itself a
// nested method call). apply() restores DDP._CurrentMethodInvocation as soon as
// the stub returns its pending promise, so the nested minimongo invocation --
// which captured the outer method as its "previous" context on entry -- restores
// that stale outer context when it settles. The connection is then stuck
// believing it is permanently inside a simulation and _apply() stops sending any
// method to the server at all: writes silently do nothing, and nothing is logged
// server-side because nothing ever arrives.
//
// applyAsync awaits the stub, so the restores unwind in the right order.
//
// Keeps Meteor.call's calling convention, including the optional
// (error, result) callback that callAsync itself rejects.
export const call = (name, ...args) => {
  let callback

  if (args.length && typeof args[args.length - 1] === 'function') {
    callback = args.pop()
  }

  if (isInSimulation()) {
    callback && callback(undefined, undefined)
    return Promise.resolve(undefined)
  }

  const promise = Meteor.callAsync(name, ...args)

  if (callback) {
    promise.then(
      result => callback(undefined, result),
      error => callback(error)
    )
    return
  }

  // No callback: stay fire-and-forget, but make the failure loud rather than
  // letting it vanish into Meteor._debug, and never leave an unhandled rejection.
  return promise.catch(error => {
    console.error(`[method] ${name} failed`, error)
  })
}
