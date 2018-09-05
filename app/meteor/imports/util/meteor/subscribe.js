import { Meteor } from 'meteor/meteor'
import { getClientKey } from './getClientKey'

const withClientKey = (name, args) => {
  if (args && typeof args !== 'object') {
    console.warn('[util] subscribe to', name, 'called with non-object argument')
  }

  if (!args) {
    args = {}
  }

  const clientKey = getClientKey()

  if (clientKey) {
    return {
      ...args,
      clientKey: clientKey
    }
  } else {
    return args
  }
}

export const subscribe = (name, args) =>
  Meteor.subscribe(name, withClientKey(name, args))

// Legacy
export const subscribeManager = (subsManager, name, args) =>
  subsManager.subscribe(name, withClientKey(name, args))
