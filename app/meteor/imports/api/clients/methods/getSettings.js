import { ReactiveVar } from 'meteor/reactive-var'
import { onNativeEvent } from '../../../startup/client/native/events'
import isEqual from 'lodash/isEqual'
import { getClient } from './getClient'

let previousSettings = {}
const settings = new ReactiveVar(null)

const updateSettings = () => {
  const currentClient = getClient()

  if (currentClient && currentClient.settings) {
    if (window.native && window.native.events) {
      const isDifferent = !isEqual(previousSettings, currentClient.settings)
      previousSettings = currentClient.settings

      if (isDifferent) {
        settings.set(currentClient.settings)
        window.native.events.emit('settings', currentClient.settings)
      }
    }
  }

  return settings.get()
}

onNativeEvent('clientKey', updateSettings)
onNativeEvent('peripherals/screenOn', updateSettings)
onNativeEvent('peripherals/screenOff', updateSettings)

export const getSettings = () =>
  updateSettings()
