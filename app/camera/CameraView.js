import React from 'react'
import { RNCamera } from 'react-native-camera'
import { StyleSheet, View } from 'react-native'
import { CameraControls } from './CameraControls'

export class CameraView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lastCodeRead: null
    }

    this.handleCodeRead = this.handleCodeRead.bind(this)
    this.handleTakePicture = this.handleTakePicture.bind(this)
  }

  handleCodeRead (e) {
    const code = e.data

    if (this.state.lastCodeRead !== code) {
      if (this.props.onCodeRead) {
        this.props.onCodeRead(code)
      }
      this.setState({
        lastCodeRead: code
      })
    }
  }

  handleTakePicture () {
    if (this.camera) {
      setTimeout(() => {
        this.camera.takePictureAsync(pictureOptions).then(data => {
          console.log('Took Picture', data.uri)
        })
      }, 130)

      // data.uri
      // this.props.onTakePicture(data.uri)
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref
          }}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          videoStabilizationMode={RNCamera.Constants.VideoStabilization.auto}
          defaultVideoQuality={RNCamera.Constants.VideoQuality['720p']}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          onBarCodeRead={this.handleCodeRead}
        />

        <CameraControls
          onTakePicture={this.handleTakePicture}
        />
      </View>
    )
  }
}

const pictureOptions = {
  quality: 1
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    color: '#FFF',
    width: '100%',
    height: '100%'
  },
  camera: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%'
  }
})
