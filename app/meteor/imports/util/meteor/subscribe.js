import { Meteor } from 'meteor/meteor'

const getClientKey = () =>
  window.native && window.native.settings.clientKey

const withClientKey = (name, args) => {
  if (args && typeof args !== 'object') {
    console.warn('[util] subscribe to', name, 'called with non-object argument', args)
  }

  if (!args) {
    args = {}
  }

  return {
    ...args,
    clientKey: getClientKey()
  }
}

export const subscribe = (name, args) =>
  Meteor.subscribe(name, withClientKey(name, args))

// Legacy
export const subscribeManager = (subsManager, name, args) =>
  subsManager.subscribe(name, withClientKey(name, args))
