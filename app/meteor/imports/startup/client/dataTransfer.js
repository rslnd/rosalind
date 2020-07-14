import { store } from '../../client/store'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Importers } from '../../api/importers'
import { loadPatient } from '../../client/patients/picker/actions'
import { onNativeEvent, toNative, getClientKey } from './native/events'
import { Meteor } from 'meteor/meteor'
import { setNextMedia } from '../../api/clients/actions/setNextMedia'
import { Clients } from '../../api'

export const ingest = ({ name, content, base64, importer }) => {
  return Importers.actions.ingest.callPromise({
    name,
    content,
    importer,
    base64
  })
}

const getNextMedia = () => {
  const clientKey = getClientKey()
  const client = Clients.find({ clientKey })
  if (client) {
    return client.nextMedia
  } else {
    return null
  }
}

export const insertMedia = async ({ name, mediaType, base64, file, appointmentId, patientId, cycle, tagIds }) => {
  console.log('[dataTransfer] insertMedia', { name, mediaType, file, ...nextMedia })

  // Drag&drop provides base64 and a a File object, native importer only provides base64. Convert base64 to File object if needed
  if (!file) {
    const rawBase = base64.split(',')[1]
    file = new Blob([window.atob(rawBase)],
      {
        type: mediaType,
        encoding: 'utf-8'
      })
  }

  // Create resized preview as base64
  const { preview, widthOriginal, heightOriginal } = await createPreview({
    base64,
    mediaType,
    quality: 20,
    maxPx: 150
  })

  const createMedia = {
    width: widthOriginal,
    height: heightOriginal,
    mediaType,
    takenAt: file.lastModifiedDate || new Date(),
    preview,
    ...(getNextMedia() || {
      appointmentId,
      patientId,
      cycle,
      tagIds
    })
  }

  const signedRequest = await call('media/insert', createMedia)
  await uploadS3({ signedRequest, file })
  await call('media/uploadComplete', {
    mediaId: signedRequest.mediaId
  })
  console.log('[dataTransfer] uploadComplete')
}

const createPreview = ({ mediaType, base64, quality, maxPx }) =>
  new Promise((resolve, reject) => {
    console.log('[dataTransfer] createPreview')
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const img = document.createElement('img')

    img.onload = function () {
      const widthOriginal = img.width
      const heightOriginal = img.height
      const scale = Math.min((maxPx / widthOriginal), (maxPx / heightOriginal))
      const widthPreview = widthOriginal * scale
      const widthScaled = heightOriginal * scale
      canvas.width = widthPreview
      canvas.height = widthScaled
      context.drawImage(img, 0, 0, widthPreview, widthScaled)
      const previewBase64 = canvas.toDataURL(mediaType, quality / 100)
      resolve({
        preview: previewBase64,
        widthOriginal,
        heightOriginal,
        widthPreview,
        widthScaled
      })
    }

    img.src = `data:${mediaType};base64,${base64}`
  })

const call = (name, args) =>
  new Promise((resolve, reject) => {
    Meteor.call(name, args, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })

const uploadS3 = ({ signedRequest, file }) => new Promise((resolve, reject) => {
  console.log('[dataTransfer] uploadS3', signedRequest)
  const { method, url, headers } = signedRequest
  const xhr = new window.XMLHttpRequest()
  xhr.onerror = reject
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        resolve()
      } else {
        reject(xhr)
      }
    }
  }

  xhr.open(method, url)

  const headersSetByBrowser = [
    'host'
  ]

  Object.keys(headers).map(headerKey => {
    if (headersSetByBrowser.includes(headerKey.toLowerCase())) {
      console.log('[dataTransfer] Not setting header', headerKey)
    } else {
      xhr.setRequestHeader(headerKey, headers[headerKey])
      console.log('[dataTransfer] Request Header', headerKey, headers[headerKey])
    }
  })

  xhr.send(file)
})

export const handleDrop = async ({ name, base64 }) => {
  try {
    const response = await ingest({ name, base64 })
    Alert.success(__('ui.importSuccessMessage'))
    if (typeof response === 'object') {
      const { result, importer } = response
      console.log('[dataTransfer] [Importers] Successfully ingested dragdrop data transfer', { importer })
      onDataTransferSuccess({ importer, result })
    }
  } catch (err) {
    Alert.error(err.message)
    console.error(err)
  }
}

const onNativeDataTransfer = async file => {
  console.log('[dataTransfer] [Importers] Received data transfer event from native binding', { name: file.path, importer: file.importer })

  switch (file.importer) {
    case 'mediaDocument':
      return insertMedia({
        base64: file.content,
        name: file.path,
        mediaType: 'image/jpeg',
        ...nextMedia
      })
    default:
      const response = await ingest({
        name: file.path,
        content: file.content,
        importer: file.importer
      })

      if (typeof response === 'object') {
        const { importer, result } = response
        onDataTransferSuccess({ importer, result, ...file })
      } else {
        onDataTransferSuccess({ importer: file.importer, ...file })
      }
  }
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
