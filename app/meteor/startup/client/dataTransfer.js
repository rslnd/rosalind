import { store } from 'client/store'
import dragDrop from 'drag-drop/buffer'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Importers } from 'api/importers'

export const ingest = ({ name, content, buffer, importer }) => {
  return Importers.actions.ingest.callPromise({
    name,
    content,
    importer,
    buffer: { blob: buffer }
  })
}

export const setupDragdrop = () => {
  dragDrop('body', (files) => {
    files.forEach((file) => {
      ingest({ name: file.name, buffer: file }).then(({ result, importer }) => {
        Alert.success(TAPi18n.__('ui.importSuccessMessage'))
        console.log('[Importers] Successfully ingested dragdrop data transfer', { importer, result })
        store.dispatch({
          type: 'DATA_TRANSFER_SUCCESS',
          importer,
          result
        })
      }).catch((err) => {
        Alert.error(err.message)
        throw err
      })
    })
  })
}

export const setupNative = () => {
  if (window.native) {
    window.native.events.on('import/dataTransfer', (file) => {
      console.log('[Importers] Received data transfer event from native binding', file)
      ingest({ name: file.path, content: file.content, importer: file.importer })
        .then(({ result, importer }) => {
          store.dispatch({
            type: 'DATA_TRANSFER_SUCCESS',
            importer,
            result
          })
        })
    })
  }
}

export default () => {
  setupDragdrop()
  setupNative()
}
