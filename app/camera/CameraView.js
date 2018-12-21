import React from 'react'
import { RNCamera } from 'react-native-camera'
import { StyleSheet, Text, View } from 'react-native'

export class CameraView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lastCodeRead: null
    }

    this.handleCodeRead = this.handleCodeRead.bind(this)
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    color: '#FFF',
    width: '100%',
    height: '100%'
  },
  camera: {
    width: '100%',
    height: '100%'
  }
})
