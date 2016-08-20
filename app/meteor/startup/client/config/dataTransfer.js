import dragDrop from 'drag-drop/buffer'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Importers } from 'api/importers'

export default () => {
  dragDrop('body', (files) => {
    files.forEach((file) => {
      Importers.methods.ingest.call({
        name: file.name,
        content: file.toString()
      }, (err, res) => {
        if (err) {
          sAlert.error(err.message)
          throw err
        }
        console.log('[Importers] Succesfully ingested', res)
        sAlert.success(TAPi18n.__('ui.importSuccessMessage'))
      })
    })
  })
}
