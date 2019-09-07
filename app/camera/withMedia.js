import { withHandlers } from 'recompose'
import { call } from './util'

const handleMedia = props => async media => {
  if (!props.pairedTo) {
    // TODO: Cache and upload after pairing
    throw new Error('Need to pair first')
  }

  const { localPath, ...mediaRest } = media
  const createMedia = {
    ...mediaRest,
    consumerId: props.pairedTo
  }
  // TODO: Send image hash to media/insert
  const signedRequest = await call(props)('media/insert', createMedia)

  // TODO: Resize and upload thumbnail first for better UX
  await uploadS3({ signedRequest, localPath })

  // TODO: Call server again to signal when upload has finished
}

const uploadS3 = ({ signedRequest, localPath }) => new Promise((resolve, reject) => {
  const { method, filename, url, mediaType, headers } = signedRequest

  console.log('signedRequest', signedRequest)
  console.log('localPath', localPath)

  const xhr = new XMLHttpRequest()
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
