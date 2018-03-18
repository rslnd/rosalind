import { withTracker } from 'meteor/react-meteor-data'
import { Settings } from '../../../api/settings'
import { SettingsScreen } from './SettingsScreen'
import { subscribe } from '../../../util/meteor/subscribe'

export const composer = (props) => {
  if (subscribe('settings').ready()) {
    const get = (key) => Settings.get(key)
    const set = (key, value) => Settings.actions.set.call({ key, value })

    const settings = Settings.find({})

    settings.get = get
    settings.set = set
    return { get, set, settings }
  }
}

export const SettingsContainer = withTracker(composer, { pure: false })(SettingsScreen)
