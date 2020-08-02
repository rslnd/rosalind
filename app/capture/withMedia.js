import { withHandlers } from 'recompose'
import { call, delay } from './util'
import { captureException } from '@sentry/react-native'
import { NativeModules } from 'react-native'
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
    consumerId: props.pairedTo,
    cycle: (mediaRest.kind === 'document') ? '' : (props.nextMedia.cycle || ''), // work around weird match failed error when passing null. evaluates falsey anyways.
    preview
  }

  await enqueue({ props, createMedia, localPath })
}

const retry = async (logTag, fn) => {
  const start = new Date()
  const tryUntil = start + (1000 * 60)
  let tries = 5

  do {
    try {
      const result = await fn()
      const end = new Date()
      console.log(logTag, 'took', end - start, 'ms')
      return result
    } catch (e) {
      console.log(logTag, 'failed, retrying', tries, 'more times after delay, error was', e)
      await delay(7000)
      tries--
    }
  } while (tries > 0 || (new Date()) < tryUntil)

  throw new Error(`Giving up ${logTag}`)
}

const enqueue = async ({ createMedia, localPath, props }) => {
  try {
    const signedRequest = await retry('createMedia', () =>
      call(props)('media/insert', createMedia))

    await retry('uploadS3', () => uploadS3({ signedRequest, localPath }))

    await retry('uploadComplete', () => call(props)('media/uploadComplete', {
      mediaId: signedRequest.mediaId
    }))
  } catch (e) {
    props.showError('tryAgain')
    captureException(e)
    console.log('Giving up', e)
  }
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
