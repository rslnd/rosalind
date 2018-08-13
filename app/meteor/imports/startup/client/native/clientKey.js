import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { Clients } from '../../../api/clients'
import { getClientKey } from '../../../util/meteor/getClientKey'

export default () => {
  if (window.native) {
    window.native.load && window.native.load()
    const loadingInterval = window.native.load && setInterval(() => {
      console.log('[Client] Attempting to load native settings')
      if (getClientKey()) {
        clearInterval(loadingInterval)
        attemptRegistration()
      } else {
        window.native.load()
        attemptRegistration()
      }
    }, 800)

    const attemptRegistration = async () => {
      const clientKey = getClientKey()
      if (clientKey) {
        const { systemInfo } = window.native

        const isOk = await Clients.actions.register.callPromise({
          clientKey,
          systemInfo
        })

        console.log('[Client] Registration', { systemInfo, isOk })
        if (!isOk) {
          Alert.error(__('ui.clientRegistrationFailed'), { timeout: 'none' })
        }

        return isOk
      } else {
        return null
      }
    }

    attemptRegistration()
  }
}
