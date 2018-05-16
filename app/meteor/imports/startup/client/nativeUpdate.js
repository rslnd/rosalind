import Alert from 'react-s-alert'
import { __ } from '../../i18n'

export default () => {
  let didNotify = false

  if (window.native) {
    window.native.events.on('update/available', ({ newVersion }) => {
      console.log('[Client] Received update available event from native binding', { newVersion })

      if (!didNotify) {
        const text = `
          <i class="fa fa-heart" title="v${newVersion}"></i>
          ${__('ui.updateAvailableMessage')}
          <br />
          <div
            class="btn btn-lg btn-default btn-block"
            style="margin-top: 5px"
            onClick="window.native.quitAndInstall()">
              ${__('ui.updateInstallNow')}
          </div>
        `

        Alert.info(text, { timeout: false, html: true })
      }

      didNotify = true
    })
  }
}
