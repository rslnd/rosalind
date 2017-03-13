import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Settings } from 'api/settings'
import { Loading } from 'client/ui/components/Loading'
import { MessagesScreen } from './MessagesScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('settings').ready()) {
    const get = Settings.get
    const set = (key, value) => Settings.actions.set.call({ key, value })

    onData(null, { get, set })
  }
}

export const SettingsContainer = composeWithTracker(composer, Loading)(MessagesScreen)
