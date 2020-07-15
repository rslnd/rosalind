import React from 'react'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { onNativeEvent, toNative } from './events'

let didNotify = false

export const updateAvailable = () => didNotify

export default () => {
  const showUpdatePrompt = ({ newVersion }) => {
    console.log('[Client] Received update available event from native binding', { newVersion })

    if (!didNotify) {
      Alert.info(<div>
        {__('ui.updateAvailableMessage')}
        <br />
        {
          <div
            className='btn btn-lg btn-default btn-block'
            style={{ marginTop: 5 }}
            onClick={() => toNative('quitAndInstall')}>
            {__('ui.updateInstallNow')}
          </div>
        }
      </div>, {
        timeout: 'none',
        customFields: {
          icon: 'heart',
          canClose: false
        }
      })
    }

    didNotify = true
  }

  onNativeEvent('updateAvailable', showUpdatePrompt)

  window.showUpdatePrompt = showUpdatePrompt
}
