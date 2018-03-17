import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Settings } from '../../../api/settings'
import { SettingsScreen } from './SettingsScreen'
import { subscribe } from '../../../util/meteor/subscribe'

export const composer = (props, onData) => {
  if (subscribe('settings').ready()) {
    const get = (key) => Settings.get(key)
    const set = (key, value) => Settings.actions.set.call({ key, value })

    const settings = Settings.find({})

    settings.get = get
    settings.set = set
    onData(null, { get, set, settings })
  }
}

export const SettingsContainer = composeWithTracker(composer, { pure: false })(SettingsScreen)
