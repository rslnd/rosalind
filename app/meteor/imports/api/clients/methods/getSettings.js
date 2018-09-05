import { Tracker } from 'meteor/tracker'
import { ReactiveVar } from 'meteor/reactive-var'
import { subscribe } from '../../../util/meteor/subscribe'
import { getClientKey } from '../../../util/meteor/getClientKey'
import { Clients } from '..'
import { onNativeEvent } from '../../../startup/client/native/events'
import isEqual from 'lodash/isEqual'

let previousSettings = {}
const settings = new ReactiveVar(null)

const updateSettings = () => {
  const clientKey = getClientKey()
  if (!clientKey) {
    return {}
  }

  subscribe('client-settings', { clientKey })
  const currentClient = Clients.findOne({ clientKey })

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
