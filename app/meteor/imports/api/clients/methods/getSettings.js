import { ReactiveVar } from 'meteor/reactive-var'
import { toNative } from '../../../startup/client/native/events'
import isEqual from 'lodash/isEqual'
import { Tracker } from 'meteor/tracker'
import { getClient } from './getClient'

let settings = new ReactiveVar(null)

export const getSettings = () => settings.get()

export const updateSettings = newSettings => {
  if (!isEqual(getSettings(), newSettings)) {
    settings.set(newSettings)
    toNative('settings', getSettings())
  }
}

export const subscribeSettings = () => {
  Tracker.autorun(() => {
    const client = getClient()
    if (client && client.settings) {
      updateSettings(client.settings)
    }
  })
}

// DEBUG
window.getSettings = getSettings
