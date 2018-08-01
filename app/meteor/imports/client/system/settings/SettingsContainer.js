import { withTracker } from '../../components/withTracker'
import { Settings } from '../../../api/settings'
import { SettingsScreen } from './SettingsScreen'
import { subscribe } from '../../../util/meteor/subscribe'

export const composer = (props) => {
  const isLoading = !subscribe('settings').ready()

  const get = (key) => Settings.get(key)
  const set = (key, value) => Settings.actions.set.call({ key, value })

  const settings = Settings.find({}).fetch()

  settings.get = get
  settings.set = set

  return { isLoading, get, set, settings }
}

export const SettingsContainer = withTracker(composer)(SettingsScreen)
