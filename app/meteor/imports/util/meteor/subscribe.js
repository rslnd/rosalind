import { Meteor } from 'meteor/meteor'
import { getClientKey } from '../../startup/client/native/events'

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
