import { Meteor } from 'meteor/meteor'
import { DDP } from 'meteor/ddp-client'

// True when the caller is currently running inside a client-side method stub.
//
// Starting a nested method call from inside a stub corrupts
// DDP._CurrentMethodInvocation. The nested invocation captures the parent's
// context on entry and restores it when its own promise settles, which is
// *after* the parent stub has already restored the outer (usually null)
// context. The connection is then stuck believing it is permanently inside a
// simulation, and from that point on _apply() short-circuits every method call
// and sends nothing to the server: writes silently do nothing and the server
// logs never show the call at all.
//
// Nested calls are pointless in a simulation anyway — Meteor returns the inner
// stub's value and performs no RPC — so the fix everywhere is to skip the
// nested call when this returns true.
export const isInSimulation = () => {
  if (Meteor.isServer) { return false }

  const invocation = DDP._CurrentMethodInvocation.get()

  return !!(invocation && invocation.isSimulation)
}

// Drop-in replacement for `await Meteor.callAsync(...)` inside a method body.
// No-ops in a client stub for the reasons above; behaves exactly like
// Meteor.callAsync everywhere else.
export const callNested = async (name, args) => {
  if (isInSimulation()) { return undefined }

  return Meteor.callAsync(name, args)
}
