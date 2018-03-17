import omit from 'lodash/fp/omit'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Clients } from '../../api/clients'

export default () => {
  if (window.native) {
    let settings = {}
    let version = null

    const attemptRegistration = async () => {
      console.log('[Client] Attempting registration')
      const clientKey = settings.native.clientKey

      const isOk = await Clients.actions.register.callPromise({
        clientKey,
        version,
        settings: omit(['clientKey'])(settings),
        systemInfo: {}
      })

      if (!isOk) {
        Alert.error(TAPi18n.__('ui.clientRegistrationFailed'), { timeout: false })
      }
    }

    window.native.events.on('settings', s => {
      settings = s
      attemptRegistration()
    })

    window.native.events.on('version', v => {
      version = v
      attemptRegistration()
    })

    attemptRegistration()
  }
}
