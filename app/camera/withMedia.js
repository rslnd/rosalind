import { withHandlers } from 'recompose'
import { call } from './util'

const handleMedia = props => async media => {
  if (!props.pairedTo) {
    // TODO: Cache and upload after pairing
    throw new Error('Need to pair first')
  }

  console.log('handleMedia')
  const { localPath, ...mediaRest } = media
  const createMedia = {
    ...mediaRest,
    consumerId: props.pairedTo
  }
  const uploadUrl = await call(props)('media/insert', createMedia)

  // upload localPath -> uploadUri
  console.log('upload url', uploadUrl)
}

export const withMedia = withHandlers({ handleMedia })
