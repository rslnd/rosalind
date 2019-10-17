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

    this.handleScan = this.handleScan.bind(this)
  }

  componentDidMount () {
    const scannerEmitter = new NativeEventEmitter(DocumentScanner)
    scannerEmitter.addListener('Scan', scan =>
      this.handleScan(scan)
    )
  }

  handleScan (scan) {
    console.log('Handling scan', scan)
    this.props.handleMedia(scan)
  }

  render () {
    const {
      handlePairingFinish,
      handleMedia,
      pairedTo,
      currentPatient,
      currentPatientId,
      ...restProps
    } = this.props

    return <View style={styles[both].container}>
        <Text style={applyStyle(this.props, styles, 'patientName')}>
          {
            currentPatient
              ? <PatientName patient={currentPatient} />
              : (currentPatientId && __('ready')) || __('pleasePair')
          }
        </Text>
        <CameraView
          onCodeRead={handlePairingFinish}
          onScan={() => {
            DocumentScanner.open()
          }}
          onMedia={handleMedia}
          showControls={pairedTo && currentPatientId}
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
      backgroundColor: 'rgba(128,128,128,0.5)'
    }
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
