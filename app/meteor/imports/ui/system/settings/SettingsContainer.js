import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Settings } from '../../../api/settings'
import { SettingsScreen } from './SettingsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('settings').ready()) {
    const get = (key) => Settings.get(key)
    const set = (key, value) => Settings.actions.set.call({ key, value })

    const settings = Settings.find({})

    settings.get = get
    settings.set = set
    onData(null, { get, set, settings })
  }
}

export const SettingsContainer = composeWithTracker(composer, { pure: false })(SettingsScreen)
