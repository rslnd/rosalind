import React from 'react'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { onNativeEvent } from './events'

export default () => {
  let didNotify = false

  onNativeEvent('update/available', ({ newVersion }) => {
    console.log('[Client] Received update available event from native binding', { newVersion })

    if (!didNotify) {
      Alert.info(<div>
        <i className='fa fa-heart' title={`v${newVersion}`} />
        &nbsp;&nbsp;
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
      </div>, { timeout: 'none' })
    }

    didNotify = true
  })
}
