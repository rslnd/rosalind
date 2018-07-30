import { Tracker } from 'meteor/tracker'
import { ReactiveVar } from 'meteor/reactive-var'
import { subscribe } from '../../../util/meteor/subscribe'
import { getClientKey } from '../../../util/meteor/getClientKey'
import { Clients } from '..'
import { onNativeEvent } from '../../../startup/client/native/events'

const settings = new ReactiveVar(null)

const updateSettings = () => {
  Tracker.autorun(() => {
    const clientKey = getClientKey()
    subscribe('client-settings', { clientKey })
    const currentClient = Clients.findOne({ clientKey })

    if (currentClient) {
      settings.set(currentClient.settings)
      if (window.native && window.native.events) {
        window.native.events.emit('settings', currentClient.settings)
      }
    }
  })
}

onNativeEvent('clientKey', updateSettings)
onNativeEvent('peripherals/screenOn', updateSettings)
onNativeEvent('peripherals/screenOff', updateSettings)

export const getSettings = () =>
  settings.get()
