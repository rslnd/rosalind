import { Meteor } from 'meteor/meteor'
import { SubsCache } from 'meteor/ccorcos:subs-cache'
import { getClientKey } from '../../startup/client/native/events'
import { parse as fromQuery } from 'query-string'

const withAuthentication = (name, args) => {
  if (args && typeof args !== 'object') {
    console.warn('[util] subscribe to', name, 'called with non-object argument')
  }

  if (!args) {
    args = {}
  }

  const clientKey = getClientKey()
  const accessToken = getAccessToken()

  if (clientKey) {
    return {
      ...args,
      clientKey
    }
  } else if (accessToken) {
    return {
      ...args,
      accessToken
    }
  } else {
    return args
  }
}

const getAccessToken = () => fromQuery(window.location.search).accessToken

export const subscribe = (name, args) =>
  Meteor.subscribe(name, withAuthentication(name, args))

export const subscribeCache = (expireAfterMinutes, maxNumberOfSubscriptions) => {
  const cache = new SubsCache(expireAfterMinutes, maxNumberOfSubscriptions)

  return {
    subscribe: (name, args) => cache.subscribe(name, withAuthentication(name, args)),
    ready: () => cache.ready(),
    clear: () => cache.clear(),
    onReady: fn => cache.onReady(fn)
  }
}
