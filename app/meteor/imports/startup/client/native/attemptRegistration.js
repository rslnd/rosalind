import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { Clients } from '../../../api/clients'

export const attemptRegistration = async ({ clientKey, systemInfo }) => {
  if (!clientKey || !systemInfo) {
    throw new Error('Cannot register without clientKey and systemInfo')
  }

  const { isOk, settings } = await Clients.actions.register.callPromise({
    clientKey,
    systemInfo
  })

  console.log('[Client] Registration', { isOk, settings })
  if (!isOk) {
    Alert.error(__('ui.clientRegistrationFailed'), { timeout: 'none' })
  }

  return { isOk, settings }
}
