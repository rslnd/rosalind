import { Meteor } from 'meteor/meteor'

// Meteor 3-compatible replacement for didericis:callpromise-mixin.
//
// The original mixin implemented callPromise by wrapping the deprecated
// synchronous `method.call(args, callback)` path. On Meteor 3, invoking a method
// that has an async stub via the sync `call`/`apply` path is broken ("Calling a
// method that has an async method stub with call/apply can lead to unexpected
// behaviours") and the call never reaches the server. `applyAsync` is the native
// async invocation path and works on both client (DDP round-trip) and server
// (local execution), since ValidatedMethod#connection defaults to `Meteor`.
export const CallPromiseMixin = (methodOptions) => {
  methodOptions.callPromise = function callPromise (args = {}) {
    return this.connection.applyAsync(this.name, [args], {
      ...(this.applyOptions || {}),
      // Resolve with the SERVER's return value (and reject on server errors),
      // not the client stub's. Without this, applyAsync resolves with the stub
      // value — so callers see "success" even when the server method failed or
      // the write never happened. This matches callAsync's behaviour.
      returnServerResultPromise: true,
      throwStubExceptions: true
    })
  }
  return methodOptions
}
