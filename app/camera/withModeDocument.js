import { compose, withState, withHandlers } from 'recompose'

const defaultMarginPercentage = 14
const defaultAspectRatio = 1 / Math.sqrt(2) // DIN

export const overlayPosition = ({
  aspectRatio = defaultAspectRatio,
  marginPercentage = defaultMarginPercentage,
  width,
  height
}) => {
  const portrait = height > width
  const shorter = portrait ? width : height

  const overlayShorter = shorter - (shorter * (marginPercentage / 100))
  const overlayLonger = overlayShorter / aspectRatio

  const left = (shorter / 2) - (overlayShorter / 2)
  const top = left

  if (portrait) {
    return {
      top,
      left,
      width: overlayShorter,
      height: overlayLonger
    }
  } else {
    return {
      top,
      left,
      width: overlayLonger,
      height: overlayShorter
    }
  }
}

const positionToHandles = ({ top, left, width, height }) => {
  return {
    topLeft: { x: left, y: top },
    topRight: { x: left + width, y: top },
    bottomRight: { x: left + width, y: top + height },
    bottomLeft: { x: left, y: top + height }
  }
}

export const withModeDocument = compose(
  withState('cropMedia', 'setCropMedia'),
  withState('cropCoordinates', 'setCropCoordinates'),
  withHandlers({
    handleCropChange: props => (image, rectangleCoordinates) => {
      props.setRectangleCoordinates(rectangleCoordinates)
    },
    handleCropStart: props => media => {
      const { width, height } = media
      const position = overlayPosition({ width, height })
      const handles = positionToHandles(position)

      props.handleOrientationLock()
      props.setCropCoordinates(handles)
      props.setCropMedia(media)
    },
    handleCropFinish: props => e => {
      props.setCropMedia(null)
      props.handleOrientationUnlock()
    },
    handleCropCancel: props => e => {
      props.setCropMedia(null)
      props.handleOrientationUnlock()
    }
  })
)
