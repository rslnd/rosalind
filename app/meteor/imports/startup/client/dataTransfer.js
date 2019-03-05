import { store } from '../../client/store'
import dragDrop from 'drag-drop/buffer'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Importers } from '../../api/importers'
import { loadPatient } from '../../client/patients/picker/actions'
import { getClientKey, onNativeEvent, toNative } from './native/events';

export const ingest = ({ name, content, base64, importer }) => {
  return Importers.actions.ingest.callPromise({
    name,
    content,
    importer,
    base64
  })
}

export const setupDragdrop = () => {
  dragDrop('body', (files) => {
    files.forEach((file) => {
      ingest({ name: file.name, base64: file.toString('base64') }).then((response) => {
        Alert.success(__('ui.importSuccessMessage'))
        if (typeof response === 'object') {
          const { result, importer } = response
          console.log('[Importers] Successfully ingested dragdrop data transfer', { importer })
          onDataTransferSuccess({ importer, result })
        }
      }).catch((err) => {
        Alert.error(err.message)
        throw err
      })
    })
  })
}

const onDataTransfer = async file => {
  console.log('[Importers] Received data transfer event from native binding', { name: file.path, importer: file.importer })

  const { importer, result } = await ingest({
    name: file.path,
    content: file.content,
    importer: file.importer
  })

  onDataTransferSuccess({ importer, result, ...file })
}

const onDataTransferSuccess = ({ importer, result, remove, path, focus }) => {
  store.dispatch({
    type: 'DATA_TRANSFER_SUCCESS',
    importer,
    result
  })

  if (importer === 'xdt') {
    store.dispatch(loadPatient(result))
  }

  toNative('dataTransferSuccess', { remove, path, focus })
}

export default () => {
  setupDragdrop()
  onNativeEvent('dataTransfer', onDataTransfer)
}
