import React from 'react'
import { StyleSheet, View, Text, NativeModules, NativeEventEmitter } from 'react-native'
import { CameraView } from './CameraView'
import { PatientName } from './PatientName'
import { __ } from './i18n'
import { landscape, both, applyStyle, portrait } from './withOrientation'
const { DocumentScanner } = NativeModules

export class MainView extends React.Component {
  constructor (props) {
    super(props)

    this.handleMedia = this.handleMedia.bind(this)
  }

  componentDidMount () {
    const scannerEmitter = new NativeEventEmitter(DocumentScanner)
    scannerEmitter.addListener('Scan', this.handleMedia('document'))
  }

  handleMedia (kind) {
    return rawMedia => {
      const media = {
        ...rawMedia,
        kind
      }

      console.log('New media of kind', kind, media)
      this.props.handleMedia(media)
    }
  }

  render () {
    const {
      handlePairingFinish,
      pairedTo,
      currentPatient,
      nextMedia,
      ...restProps
    } = this.props

    return <View style={styles[both].container}>
        <Text style={applyStyle(this.props, styles, 'patientName')}>
          {
            (currentPatient && nextMedia)
              ? <>
                <PatientName patient={currentPatient} />
                {nextMedia.cycle
                  ? <Text>&emsp;(Sitzung {nextMedia.cycle})</Text>
                  : <Text>&emsp;(Neue Sitzung) {JSON.stringify(nextMedia.cycle)}</Text>}
              </>
              : <Text>{(nextMedia && __('ready')) || __('pleasePair')}</Text>
          }
        </Text>
        <CameraView
          onCodeRead={handlePairingFinish}
          onScan={() => {
            DocumentScanner.open()
          }}
          onMedia={this.handleMedia('photo')}
          showControls={pairedTo && nextMedia}
          {...restProps}
        />
      </View>
  }
}

const styles = {
  [both]: StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      backgroundColor: '#ccc'
    },
    patientName: {
      position: 'absolute',
      zIndex: 2,
      top: 0,
      left: 0,
      backgroundColor: 'rgba(128,128,128,0.5)',
      display: 'flex'
    },
  }),
  [portrait]: StyleSheet.create({
    patientName: {
      padding: 6,
      paddingTop: 25,
      width: '100%',
      right: 0
    }
  }),
  [landscape]: StyleSheet.create({
    patientName: {
      padding: 6,
      width: 'auto'
    }
  })
}
