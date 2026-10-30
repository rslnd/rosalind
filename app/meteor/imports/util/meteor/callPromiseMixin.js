import { isInSimulation } from './isInSimulation'

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
    // Never start a nested call from inside a client stub: it corrupts
    // DDP._CurrentMethodInvocation and wedges the connection into a permanent
    // simulation, after which no method reaches the server at all. Meteor
    // performs no RPC for a nested call anyway, so nothing is lost but the
    // inner stub's own optimistic write. See isInSimulation().
    if (isInSimulation()) {
      return Promise.resolve(undefined)
    }

    return this.connection.applyAsync(this.name, [args], {
      ...(this.applyOptions || {}),
      // Resolve with the SERVER's return value (and reject on server errors),
      // not the client stub's. Without this, applyAsync resolves with the stub
      // value — so callers see "success" even when the server method failed or
      // the write never happened. This matches callAsync's behaviour.
      returnServerResultPromise: true,
      // ValidatedMethod puts `returnStubValue: true` in applyOptions by
      // default. In Meteor 3's _apply that flag wins over
      // returnServerResultPromise:
      //   result = options.returnStubValue ? promise.then(() => stubReturnValue) : promise
      // so the promise would still resolve with the stub's value. Actions
      // declared `simulation: false` return undefined from their stub, which is
      // how callers of e.g. patients/upsert or */insert ended up with undefined
      // instead of the new _id. Errors still propagate either way; only the
      // resolved value differs.
      returnStubValue: false,
      throwStubExceptions: true
    })
  }

  // ValidatedMethod#call goes through the synchronous `connection.apply`. On
  // Meteor 3 every method built here has an async stub (`run` is an async
  // function), and `apply` does not await it: it warns ("Calling a method that
  // has an async method stub with call/apply can lead to unexpected
  // behaviours"), then calls _retrieveAndStoreOriginals() before the stub's
  // minimongo writes have happened, so the optimistic update is never tracked
  // and never correctly reverted. Worse, with no callback the server's error is
  // swallowed into Meteor._debug, which is why so many writes appeared to do
  // nothing at all. Route `call` through the same awaited path as callPromise.
  methodOptions.call = function call (args, callback) {
    // Accept calling with just a callback, like ValidatedMethod#call does
    if (typeof args === 'function') {
      callback = args
      args = {}
    }

    const name = this.name
    const promise = this.callPromise(args)

    if (callback) {
      promise.then(
        result => callback(undefined, result),
        error => callback(error)
      )
      return
    }

    // No callback: keep it fire-and-forget (callers rely on that) but make the
    // failure loud instead of silent, and never leave an unhandled rejection.
    return promise.catch(error => {
      console.error(`[method] ${name} failed`, error)
    })
  }

  return methodOptions
}
