import React from 'react'
import { RNCamera } from 'react-native-camera'
import { StyleSheet, View, Dimensions } from 'react-native'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import { CameraControls } from './CameraControls'
import { portrait, landscapeLeft, portraitUpsideDown, landscapeRight, landscape } from './withOrientation'
import { CameraViewfinder } from './CameraViewfinder'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export class CameraView extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      lastCodeRead: null,
      pointOfInterest: null,
      absolutePointOfInterest: null
    }

    this.autofocusTimeout = null

    this.handleCodeRead = this.handleCodeRead.bind(this)
    this.handleTakePicture = this.handleTakePicture.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleFocusChanged = this.handleFocusChanged.bind(this)
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

  handleFocus (e) {
    if (e.nativeEvent.state !== State.ACTIVE) { return }

    if (this.autofocusTimeout) {
      clearTimeout(this.autofocusTimeout)
    }

    const { x, y } = e.nativeEvent
    const { orientationSpecific } = this.props

    const autofocusTimeout = 2500

    const [ x2, y2 ] = absoluteToRelativeCoords(x, y, orientationSpecific)

    this.setState({
      absolutePointOfInterest: { x, y },
      pointOfInterest: {
        x: x2,
        y: y2
      }
    })

    this.autofocusTimeout = setTimeout(() => {
      this.setState({
        pointOfInterest: undefined,
        absolutePointOfInterest: undefined
      })
    }, autofocusTimeout)

    console.log(`Focus ${orientationSpecific} (${x},${y}) (${x2},${y2})`)
  }

  handleFocusChanged (e) {
    console.log('Focus changed', e)
  }

  async handleTakePicture () {
    if (!this.camera) {
      throw new Error('Camera ref not available')
    }

    // Avoid UI lag
    await delay(130)

    const {
      width,
      height,
      uri
    } = await this.camera.takePictureAsync(pictureOptions)

    const takenAt = new Date()
    const mediaType = 'image/jpeg'

    const media = {
      width,
      height,
      localPath: uri,
      mediaType,
      takenAt
    }

    if (this.props.onMedia) {
      console.log('Took Picture', media)
      this.props.onMedia(media)
    }
  }

  componentWillUnmount () {
    if (this.autofocusTimeout) {
      clearTimeout(this.autofocusTimeout)
    }
  }

  render () {
    const { showControls, orientation } = this.props

    return (
      <View style={styles.container}>
        <TapGestureHandler
          onHandlerStateChange={this.handleFocus}
        >
          <View style={styles.container}>
            <RNCamera
              ref={ref => {
                this.camera = ref
              }}
              onPress={this.handleFocus}
              style={styles.camera}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.off}
              videoStabilizationMode={RNCamera.Constants.VideoStabilization.auto}
              defaultVideoQuality={RNCamera.Constants.VideoQuality['720p']}
              barCodeTypes={barCodeTypes}
              onBarCodeRead={this.handleCodeRead}
              autoFocusPointOfInterest={this.state.pointOfInterest}
            />

            <CameraViewfinder
              position={this.state.absolutePointOfInterest}
            />

            {
              showControls &&
                <CameraControls
                  onTakePicture={this.handleTakePicture}
                  orientation={orientation}
                />
            }
          </View>
        </TapGestureHandler>
      </View>
    )
  }
}

const barCodeTypes = [
  RNCamera.Constants.BarCodeType.qr
]

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

// Transform screen coods to iOS camera focus ratio:
// 0,0 is top left in landscape
// 0,0 is top right in portrait
const absoluteToRelativeCoords = (x, y, orientation) => {
  const { height, width } = Dimensions.get('window')

  const [ longer, shorter ] =
    width > height
    ? [ width, height ]
    : [ height, width ]

  let x2, y2
  switch (orientation) {
    case portrait:
      x2 = y / longer
      y2 = 1 - x / shorter
      break
    case portraitUpsideDown:
      x2 = y / longer
      y2 = 1 - x / shorter
      break
    case landscape:
    case landscapeLeft:
      x2 = x / longer
      y2 = y / shorter
      break
    case landscapeRight:
      x2 = 1 - x / longer
      y2 = 1 - y / shorter
      break
    default: return
  }

  return [x2, y2]
}
