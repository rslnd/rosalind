import { sAlert } from 'meteor/juliancwirko:s-alert'
import { TAPi18n } from 'meteor/tap:i18n'

export default () => {
  let didNotify = false

  if (window.native) {
    window.native.events.on('update/available', ({ newVersion }) => {
      console.log('[Client] Received update available event from native binding', { newVersion })

      if (!didNotify) {
        const text = `
          <i class="fa fa-heart" title="v${newVersion}"></i>
          ${TAPi18n.__('ui.updateAvailableMessage')}
          <br />
          <div
            class="btn btn-lg btn-default btn-block"
            style="margin-top: 5px"
            onClick="window.native.quitAndInstall()">
              ${TAPi18n.__('ui.updateInstallNow')}
          </div>
        `

        sAlert.info(text, { timeout: false, html: true })
      }

      didNotify = true
    })
  }
}
