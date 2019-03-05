import { ReactiveVar } from 'meteor/reactive-var'
import { onNativeEvent } from '../../../startup/client/native/events'
import isEqual from 'lodash/isEqual'

let settings = new ReactiveVar(null)

const updateSettings = newSettings => {
  if (!isEqual(settings, newSettings)) {
    settings.set(newSettings)
  }
}

onNativeEvent('settings', updateSettings)
onNativeEvent('peripherals/screenOn', updateSettings)
onNativeEvent('peripherals/screenOff', updateSettings)

export const getSettings = () => settings.get()
