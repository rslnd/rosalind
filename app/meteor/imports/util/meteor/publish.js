import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { isAllowed } from './isAllowed'

const wrappedPublication = ({ name, args = {}, roles, fn, allowAnonymous, requireClientKey, debug = false }) => {
  // if (!roles) {
  //   console.warn('Publication', name, 'is not restricted to any roles')
  // }

  if (debug && process.env.NODE_ENV !== 'development') {
    throw new Error(`Publication ${name} has debug flag set in non-development environment`)
  }

  return function (clientArgs = {}) {
    try {
      check(clientArgs, {
        clientKey: Match.Maybe(String),
        accessToken: Match.Maybe(String),
        ...args
      })
    } catch (e) {
      console.error('Publication', name, 'was called with clientArgs', clientArgs, 'that failed check:', e.name, e.message)
      throw e
    }

    if (isAllowed({
      allowAnonymous,
      requireClientKey,
      connection: this.connection,
      userId: this.userId,
      clientKey: clientArgs.clientKey,
      accessToken: clientArgs.accessToken,
      roles,
      debug
    })) {
      const result = fn.call(this, clientArgs)
      if (debug && result && result.count) {
        console.log(`Publication ${name} returned cursor with ${result.count()} documents`)
      }
      return result
    } else {
      if (debug) {
        console.log(`Publication ${name} not allowed`)
      }
      return undefined
    }
  }
}

export const publishComposite = options =>
  Meteor.publishComposite(options.name, wrappedPublication(options))

export const publish = options =>
  Meteor.publish(options.name, wrappedPublication(options))
