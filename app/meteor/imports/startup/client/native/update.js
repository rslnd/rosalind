import React from 'react'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { onNativeEvent } from './events'

export default () => {
  let didNotify = false

  const showUpdatePrompt = ({ newVersion }) => {
    console.log('[Client] Received update available event from native binding', { newVersion })

    if (!didNotify) {
      Alert.info(<div>
        {__('ui.updateAvailableMessage')}
        <br />
        {
          window.native.quitAndInstall &&
            <div
              className='btn btn-lg btn-default btn-block'
              style={{ marginTop: 5 }}
              onClick={() => window.native.quitAndInstall()}>
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

  onNativeEvent('update/available', showUpdatePrompt)

  window.showUpdatePrompt = showUpdatePrompt
}
