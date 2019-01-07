import memoize from 'lodash/memoize'
import { compose, withState, withHandlers, withProps } from 'recompose'

export const cameraMode = {
  photo: 'photo',
  document: 'document'
}

const nextMode = memoize(mode => {
  const keys = Object.keys(cameraMode)
  return keys[(keys.indexOf(mode) + 1) % keys.length]
})

export const withCameraMode = compose(
  withState('cameraMode', 'setCameraMode', cameraMode.document),
  withHandlers({
    handleNextCameraMode: props => e => {
      props.setCameraMode(nextMode(props.cameraMode))
    }
  }),
  withProps(props => ({
    nextCameraMode: nextMode(props.cameraMode)
  }))
)
