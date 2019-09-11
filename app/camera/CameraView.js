import React from 'react'
import { RNCamera } from 'react-native-camera'
import { StyleSheet, View, Dimensions } from 'react-native'
import { Controls } from './Controls'
import { portrait, landscapeLeft, portraitUpsideDown, landscapeRight, landscape } from './withOrientation'
import { CameraViewfinder } from './CameraViewfinder'
import { delay } from './util'
import { Icon } from './Icon';

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
  }

  handleCodeRead (e) {
    const code = e.data
    const { onCodeRead } = this.props

    if (this.state.lastCodeRead !== code) {
      if (onCodeRead) {
        onCodeRead(code)
      }
      this.setState({
        lastCodeRead: code
      })
    }
  }

  handleFocus (e) {
    const { orientation, cropMedia } = this.props

    if (cropMedia) { return }
    // if (e.nativeEvent.state !== State.ACTIVE) { return }

    if (this.autofocusTimeout) {
      clearTimeout(this.autofocusTimeout)
    }

    const { x, y } = e.nativeEvent
    const orientationSpecific = orientation[1]

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

  async handleTakePicture () {
    const {
      onMedia,
      handleCropStart
    } = this.props

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

    console.log('Took Picture', media)
    onMedia(media)
  }

  componentWillUnmount () {
    if (this.autofocusTimeout) {
      clearTimeout(this.autofocusTimeout)
    }
  }

  render () {
    const {
      orientation,
      showControls
    } = this.props

    const {
      pointOfInterest,
      absolutePointOfInterest
    } = this.state

    return (
      <View style={styles.container}>
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
            autoFocusPointOfInterest={pointOfInterest}
            playSoundOnCapture={false}
            captureAudio={false}
          />
        </View>

        {
          showControls
            ? <Controls
              onTakePicture={this.handleTakePicture}
              onScan={this.props.onScan}
              orientation={orientation}
            />
            : <View style={styles.pleasePair}>
              <Icon name='expand' style={styles.pleasePairIcon} />
            </View>
        }
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
  },
  pleasePair: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    opacity: 0.4
  },
  pleasePairIcon: {
    flex: 1,
    fontSize: 160,
    color: '#000',
    textAlign: 'center',
    width: '100%'
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
