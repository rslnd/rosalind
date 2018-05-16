import omit from 'lodash/fp/omit'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Clients } from '../../api/clients'

export default () => {
  if (window.native) {
    window.native.load && window.native.load()
    const loadingInterval = window.native.load && setInterval(() => {
      console.log('[Client] Attempting to load native settings')
      if (settings && version && systemInfo) {
        clearInterval(loadingInterval)
      } else {
        window.native.load()
      }
    }, 300)

    let settings = null
    let version = null
    let systemInfo = null

    const attemptRegistration = async () => {
      if (settings && version && systemInfo) {
        const clientKey = settings.clientKey

        const isOk = await Clients.actions.register.callPromise({
          clientKey,
          version,
          settings: omit(['clientKey'])(settings),
          systemInfo: {}
        })

        console.log('[Client] Registration', { version, systemInfo, isOk })
        if (!isOk) {
          Alert.error(__('ui.clientRegistrationFailed'), { timeout: false })
        }
      }
    }

    window.native.events.on('settings', s => {
      settings = s
      attemptRegistration()
    })

    window.native.events.on('systemInfo', s => {
      systemInfo = s
      attemptRegistration()
    })

    window.native.events.on('version', v => {
      version = v
      attemptRegistration()
    })

    attemptRegistration()
  }
}
