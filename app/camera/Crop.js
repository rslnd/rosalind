import React from 'react'
import PerspectiveCrop from 'react-native-perspective-image-cropper'

export class Crop extends React.Component {
  render () {
    const {
      cropMedia,
      cropCoordinates,
      handleCropChange
    } = this.props

    return <PerspectiveCrop
      width={cropMedia.width}
      height={cropMedia.height}
      cropCoordinates={cropCoordinates}
      updateImage={handleCropChange}
      initialImage={cropMedia.localPath}
      overlayColor='rgba(18,190,210, 1)'
      overlayStrokeColor='rgba(20,190,210, 1)'
      handlerColor='rgba(20,150,160, 1)'
    />
  }
}
