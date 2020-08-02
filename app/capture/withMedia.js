import { withHandlers } from 'recompose'
import { call, delay } from './util'
import { captureException } from '@sentry/react-native'
import { NativeModules } from 'react-native'
import uuid from 'uuid'
const { MediaResizer } = NativeModules

const createPreview = ({ path, width, height, quality }) =>
  new Promise((resolve, reject) => {
    MediaResizer.createPreview(path, width, height, quality, (err, base64) => {
      if (err) {
        captureException(err)
        reject(err)
      } else {
        resolve(base64)
      }
    })
  })

const handleMedia = props => async media => {
  if (!props.pairedTo) {
    props.showError('notConnected')
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
    ...props.nextMedia,
    ...mediaRest,
    takenAt: media.takenAt || new Date(),
    nonce: uuid.v4(),
    consumerId: props.pairedTo,
    cycle: (mediaRest.kind === 'document') ? '' : (props.nextMedia.cycle || ''), // work around weird match failed error when passing null. evaluates falsey anyways.
    preview
  }

  await enqueue({ props, createMedia, localPath })
}

const retry = async (logTag, props, fn) => {
  const start = new Date()
  const tryUntil = start + (1000 * 60)
  let tries = 5

  do {
    try {
      const result = await fn()
      const end = new Date()
      console.log(logTag, 'took', end - start, 'ms')

      if (tries < 5) {
        props.setAlert(null)
      }

      return result
    } catch (e) {
      props.showWarning('retryingPleaseWait')
      console.log(logTag, 'failed, retrying', tries, 'more times after delay, error was', e)
      await delay(7000)
      tries--
    }
  } while (tries > 0 || (new Date()) < tryUntil)

  props.showError('tryAgain')
  throw new Error(`Giving up ${logTag}`)
}

const enqueue = async ({ createMedia, localPath, props }) => {
  try {
    const signedRequests = await retry('createMedia', props, () =>
      call(props)('media/insert', createMedia))

    await retry('uploadS3', props, () => uploadS3WithFallback({ signedRequests, localPath, props }))

    await retry('uploadComplete', props, () => call(props)('media/uploadComplete', {
      mediaId: signedRequests[0].mediaId
    }))
  } catch (e) {
    props.showError('tryAgain')
    captureException(e)
    console.log('Giving up', e)
  }
}

const uploadS3WithFallback = async ({ signedRequests, localPath, props }) => {
  for (let i = 0; i < signedRequests.length; i++) {
    const signedRequest = signedRequests[i]
    try {
      console.log(`upload: S3 ${i} trying`)
      const result = await uploadS3({ signedRequest, localPath })
      console.log(`upload: S3 ${i} succeeded`)
      return result
    } catch(e) {
      props.showWarning('retryingPleaseWait')
      console.log(`upload: S3 ${i} failed, falling back`)
    }
  }

  throw new Error(`${signedRequests.length} S3 fallbacks exhausted, giving up`)
}

const uploadS3 = ({ signedRequest, localPath }) => new Promise((resolve, reject) => {
  const { method, filename, url, mediaType, headers } = signedRequest

  console.log('signedRequest', signedRequest)
  console.log('localPath', localPath)

  const xhr = new global.XMLHttpRequest()
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
