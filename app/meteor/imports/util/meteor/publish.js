import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { isAllowed } from './isAllowed'

const wrappedPublication = ({ name, args = {}, roles, fn, allowAnonymous, requireClientKey }) => {
  // if (!roles) {
  //   console.warn('Publication', name, 'is not restricted to any roles')
  // }

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
      roles
    })) {
      return fn.call(this, clientArgs)
    } else {
      return undefined
    }
  }
}

export const publishComposite = options =>
  Meteor.publishComposite(options.name, wrappedPublication(options))

export const publish = options =>
  Meteor.publish(options.name, wrappedPublication(options))
