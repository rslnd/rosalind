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
  const signedRequest = await call(props)('media/insert', createMedia)

  // TODO: Resize and upload thumbnail first for better UX
  return await uploadS3({ signedRequest, localPath })
}

const uploadS3 = ({ signedRequest, localPath }) => new Promise((resolve, reject) => {
  const { method, filename, url, mediaType, headers } = signedRequest

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
  xhr.setRequestHeader('Content-Type', mediaType)

  Object.keys(headers).map(headerKey =>
    xhr.setRequestHeader(headerKey, headers[headerKey])
  )

  xhr.send({
    uri: localPath,
    type: mediaType,
    name: filename
  })
})

export const withMedia = withHandlers({ handleMedia })
