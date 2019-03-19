import { Meteor } from 'meteor/meteor'
import { SubsCache } from 'meteor/ccorcos:subs-cache'
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

export const subscribeCache = (expireAfterMinutes, maxNumberOfSubscriptions) => {
  const cache = new SubsCache(expireAfterMinutes, maxNumberOfSubscriptions)

  return {
    subscribe: (name, args) => cache.subscribe(name, withClientKey(name, args)),
    ready: () => cache.ready(),
    clear: () => cache.clear(),
    onReady: fn => cache.onReady(fn)
  }
}
