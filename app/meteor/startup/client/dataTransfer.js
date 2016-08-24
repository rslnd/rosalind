import dragDrop from 'drag-drop/buffer'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Importers } from 'api/importers'

export const ingest = ({ name, content, importer }, callback = () => {}) => {
  Importers.methods.ingest.call({ name, content, importer }, (err, res) => {
    if (err) {
      callback(err)
      throw err
    } else {
      console.log('[Importers] Successfully ingested', res)
      callback(null, res)
    }
  })
}

export const setupDragdrop = () => {
  dragDrop('body', (files) => {
    files.forEach((file) => {
      ingest({ name: file.name, content: file.toString() }, (err, res) => {
        if (err) {
          sAlert.error(err.message)
        } else {
          sAlert.success(TAPi18n.__('ui.importSuccessMessage'))
        }
      })
    })
  })
}

export const setupNative = () => {
  if (window.native) {
    window.native.events.on('import/dataTransfer', (file) => {
      console.log('[Importers] Received data transfer event from native binding', file)
      ingest({ name: file.path, content: file.content, importer: file.importer })
    })
  }
}

export default () => {
  setupDragdrop()
  setupNative()
}
