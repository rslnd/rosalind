import { ReactiveVar } from 'meteor/reactive-var'
import { toNative } from '../../../startup/client/native/events'
import isEqual from 'lodash/isEqual'
import { Tracker } from 'meteor/tracker'
import { getClient } from './getClient'

let settings = new ReactiveVar(null)

export const updateSettings = newSettings => {
  if (!isEqual(settings, newSettings)) {
    settings.set(newSettings)
    toNative('settings', settings)
  }
}

export const subscribeSettings = initialSettings => {
  Tracker.autorun(() => {
    const client = getClient()
    updateSettings(client.settings)
  })
}

export const getSettings = () => settings.get()

// DEBUG
window.getSettings = getSettings
