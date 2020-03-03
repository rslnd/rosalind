import { withHandlers } from 'recompose'
import { call } from './util'
import { NativeModules } from 'react-native'
const { MediaResizer } = NativeModules

const createPreview = ({ path, width, height, quality }) =>
  new Promise((resolve, reject) => {
    MediaResizer.createPreview(path, width, height, quality, (err, base64) => {
      if (err) {
        reject(err)
      } else {
        resolve(base64)
      }
    })
  })

const handleMedia = props => async media => {
  if (!props.pairedTo) {
    // TODO: Cache and upload after pairing
    throw new Error('Need to pair first')
  }

  const { localPath, ...mediaRest } = media

  console.log('Handling new media', media)

  // Create and upload thumbnail with first request
  const quality = 20
  const maxPx = 150
  const rawPreview = await createPreview({
    path: localPath,
    width: maxPx,
    height: maxPx,
    quality
  })

  const preview = `data:image/jpeg;base64,${rawPreview}`

  console.log('Resized to base64 length', preview.length)

  const createMedia = {
    ...mediaRest,
    takenAt: media.takenAt || new Date(),
    consumerId: props.pairedTo,
    patientId: props.currentPatientId,
    appointmentId: props.currentAppointmentId,
    cycle: (mediaRest.kind === 'document') ? '' : (props.currentCycle || ''), // work around weird match failed error when passing null. evaluates falsey anyways.
    preview
  }
  const signedRequest = await call(props)('media/insert', createMedia)

  await uploadS3({ signedRequest, localPath })

  await call(props)('media/uploadComplete', {
    mediaId: signedRequest.mediaId
  })
}

const uploadS3 = ({ signedRequest, localPath }) => new Promise((resolve, reject) => {
  const { method, filename, url, mediaType, headers } = signedRequest

  console.log('signedRequest', signedRequest)
  console.log('localPath', localPath)

  const xhr = new global.XMLHttpRequest()
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

  Object.keys(headers).map(headerKey => {
    xhr.setRequestHeader(headerKey, headers[headerKey])
    console.log('Request Header', headerKey, headers[headerKey])
  })

  xhr.send({
    uri: localPath,
    type: mediaType,
    name: filename
  })
})

export const withMedia = withHandlers({ handleMedia })
