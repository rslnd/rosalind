import Alert from 'react-s-alert'
import { withTracker } from '../../components/withTracker'
import { Settings } from '../../../api/settings'
import { SettingsScreen } from './SettingsScreen'
import { subscribe } from '../../../util/meteor/subscribe'
import { __ } from '../../../i18n'
import { prompt } from '../../layout/Prompt'

export const composer = (props) => {
  const isLoading = !subscribe('settings').ready()

  const get = (key) => Settings.get(key)
  const set = (key, value) => Settings.actions.set.call({ key, value })

  const settings = Settings.find({}).fetch()

  settings.get = get
  settings.set = set

  const action = x => x
  .then(_ => Alert.success(__('ui.saved')))
  .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = async (settingId, update) => {
    if (update && update.$set && update.$set.isPublic) {
      const ok = await prompt({
        title: 'Das Ändern dieses Feldes stellt ein mögliches Sicherheitsrisiko dar. Wirklich mit der Änderung fortfahren?'
      })
      if (!ok) { return }
    }

    action(Settings.actions.update.callPromise({ settingId, update }))
  }

  const handleInsert = (setting) =>
    action(Settings.actions.insert.callPromise({ setting }))

  const handleRemove = (settingId) =>
    {
      console.log('hard remove', settingId)
      action(Settings.actions.hardRemove.callPromise({ settingId }))
    }

  return {
    isLoading,
    get,
    set,
    settings,
    handleInsert,
    handleUpdate,
    handleRemove
  }
}

export const SettingsContainer = withTracker(composer)(SettingsScreen)
