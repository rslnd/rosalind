import { store } from '../../client/store'
import Alert from 'react-s-alert'
import { __ } from '../../i18n'
import { Importers } from '../../api/importers'
import { loadPatient } from '../../client/patients/picker/actions'
import { onNativeEvent, toNative } from './native/events'
import { Meteor } from 'meteor/meteor'
import { getClient } from '../../api/clients/methods/getClient'
import { innoPatientsImport } from '../../api/importers/innoPatientsImport'

export const ingest = ({ name, content, base64, importer }) => {
  return Importers.actions.ingest.callPromise({
    name,
    content,
    importer,
    base64
  })
}

getClient() // to cache subscription
const getNextMedia = () => {
  const client = getClient()
  if (client) {
    return client.nextMedia
  } else {
    return null
  }
}

// base64DecToArr and b64ToUint6 originally from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
const base64DecToArr = (sBase64, nBlocksSize) => {
  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen)
  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4)
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255
      }
      nUint24 = 0;
    }
  }
  return taBytes
}

const b64ToUint6 = (nChr) => {
  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0
}

export const insertMedia = async ({ name, mediaType, base64, file, kind = 'document', appointmentId, patientId, cycle, tagIds }) => {
  const nextMedia = (getNextMedia() || {
    appointmentId,
    patientId,
    cycle,
    tagIds
  })


  console.log('[dataTransfer] insertMedia', { name, mediaType, file, ...nextMedia })

  // Drag&drop provides base64 and a a File object, native importer only provides base64. Convert base64 to File object if needed
  if (!file) {
    const blob = new Blob(
      [base64DecToArr(base64)],
      { type: mediaType }
    )

    file = new File([blob], name, {
      type: mediaType,
      lastModified: Date.now()
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
    kind,
    ...nextMedia
  }

  const signedRequests = await call('media/insert', createMedia)
  await uploadS3WithFallback({ signedRequests, file })
  await call('media/uploadComplete', {
    mediaId: signedRequests[0].mediaId
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

const uploadS3WithFallback = async ({ signedRequests, file }) => {
  for (let i = 0; i < signedRequests.length; i++) {
    const signedRequest = signedRequests[i]
    try {
      console.log(`upload: S3 ${i} trying`)
      const result = await uploadS3({ signedRequest, file })
      console.log(`upload: S3 ${i} succeeded`)
      return result
    } catch(e) {
      console.log(`upload: S3 ${i} failed, falling back`)
    }
  }

  throw new Error(`${signedRequests.length} S3 fallbacks exhausted, giving up`)
}

const uploadS3 = ({ signedRequest, file }) => new Promise((resolve, reject) => {
  console.log('[dataTransfer] uploadS3', signedRequest)
  const { method, url, headers } = signedRequest
  const xhr = new window.XMLHttpRequest()
  xhr.onerror = reject
  xhr.ontimeout = reject
  xhr.timeout = 4000
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
      try {
        const result = await insertMedia({
          base64: file.base64 || file.content,
          name: file.path,
          mediaType: 'image/jpeg'
        })

        onDataTransferSuccess({ importer: file.importer, ...file })

        return result
      } catch (e) {
        console.error(e)
        Alert.error('Entschuldigung! Bild konnte nicht gespeichert werden. Bitte Support kontaktieren.')
      }
      break;
    case 'innoPatients':
      try {
        const result = await innoPatientsImport({
          json: file.content
        })

        onDataTransferSuccess({ importer: file.importer, ...file })

        return result
      } catch (e) {
        console.error(e)
      }
      break;
    default:
      const response = await ingest({
        name: file.path,
        content: file.content,
        importer: file.importer
      })

      if (typeof response === 'object') {
        const { importer, result } = response
        return onDataTransferSuccess({ importer, result, ...file })
      }
  }

  // Avoid 859 bug (2020-08-18) where non-removed imports pile up until they all flush into a wrong target
  onDataTransferSuccess({ importer: file.importer, ...file })
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
