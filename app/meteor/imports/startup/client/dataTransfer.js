import { store } from '../../client/store'
import dragDrop from 'drag-drop/buffer'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Importers } from '../../api/importers'

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
      ingest({ name: file.name, buffer: file }).then((response) => {
        Alert.success(__('ui.importSuccessMessage'))
        if (typeof response === 'object') {
          const { result, importer } = response
          console.log('[Importers] Successfully ingested dragdrop data transfer', { importer })
          store.dispatch({
            type: 'DATA_TRANSFER_SUCCESS',
            importer,
            result
          })
        }
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
      console.log('[Importers] Received data transfer event from native binding', { name: file.path, importer: file.importer })
      ingest({ name: file.path, content: file.content, importer: file.importer })
        .then((response) => {
          if (typeof response === 'object') {
            const { result, importer } = response
            store.dispatch({
              type: 'DATA_TRANSFER_SUCCESS',
              importer,
              result
            })
          }

          if (window.native.dataTransferSuccess) {
            const { remove, path, focus } = file
            window.native.dataTransferSuccess({ remove, path, focus })
          }
        })
    })
  }
}

export default () => {
  setupDragdrop()
  setupNative()
}
