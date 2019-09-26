import { store } from '../../client/store'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Importers } from '../../api/importers'
import { loadPatient } from '../../client/patients/picker/actions'
import { onNativeEvent, toNative } from './native/events'

export const ingest = ({ name, content, base64, importer }) => {
  return Importers.actions.ingest.callPromise({
    name,
    content,
    importer,
    base64
  })
}

export const handleDrop = async ({ name, base64 }) => {
  try {
    const response = await ingest({ name, base64 })
    Alert.success(__('ui.importSuccessMessage'))
    if (typeof response === 'object') {
      const { result, importer } = response
      console.log('[Importers] Successfully ingested dragdrop data transfer', { importer })
      onDataTransferSuccess({ importer, result })
    }
  } catch (err) {
    Alert.error(err.message)
    console.error(err)
  }
}

const onNativeDataTransfer = async file => {
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

const preventDragBody = () => {
  const noop = e => {
    e.preventDefault()
    e.stopPropagation()
  }
  document.body.addEventListener('dragenter', noop)
  document.body.addEventListener('dragleave', noop)
  document.body.addEventListener('dragover', noop)
  document.body.addEventListener('drop', noop)
}

export default () => {
  preventDragBody()
  onNativeEvent('dataTransfer', onNativeDataTransfer)
}
