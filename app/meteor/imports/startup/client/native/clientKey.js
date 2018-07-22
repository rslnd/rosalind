import omit from 'lodash/fp/omit'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { Clients } from '../../../api/clients'

export default () => {
  if (window.native) {
    window.native.load && window.native.load()
    const loadingInterval = window.native.load && setInterval(() => {
      console.log('[Client] Attempting to load native settings')
      if (window.native.settings && window.native.version && window.native.systemInfo) {
        clearInterval(loadingInterval)
        attemptRegistration()
      } else {
        window.native.load()
        attemptRegistration()
      }
    }, 300)

    const attemptRegistration = async () => {
      const { settings, version, systemInfo } = window.native

      if (settings && version && systemInfo) {
        const clientKey = settings.clientKey

        const isOk = await Clients.actions.register.callPromise({
          clientKey,
          version,
          settings: omit(['clientKey'])(settings),
          systemInfo
        })

        console.log('[Client] Registration', { version, systemInfo, isOk })
        if (!isOk) {
          Alert.error(__('ui.clientRegistrationFailed'), { timeout: 'none' })
        }

        return isOk
      } else {
        const missingKeys = ['settings', 'version', 'systemInfo'].filter(key => !window.native[key])
        console.log(`[Client] Missing native: ${missingKeys}`)
        return null
      }
    }

    attemptRegistration()
  }
}
