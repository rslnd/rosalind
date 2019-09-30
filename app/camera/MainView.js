import React from 'react'
import { StyleSheet, View, Text, NativeModules, NativeEventEmitter } from 'react-native'
import { CameraView } from './CameraView'
import { PatientName } from './PatientName'
import { __ } from './i18n'
import { landscape, both, applyStyle, portrait } from './withOrientation'

// NativeModules.Scanner.initialize()
// const scannerEmitter = new NativeEventEmitter(NativeModules.Scanner)
// scannerEmitter.addListener('Scan', scan => console.log('got scan event', scan))

export const MainView = ({
  handlePairingFinish,
  handleMedia,
  pairedTo,
  currentPatient,
  currentPatientId,
  ...props
}) =>
  <View style={styles[both].container}>
    <Text style={applyStyle(props, styles, 'patientName')}>
      {
        currentPatient
          ? <PatientName patient={currentPatient} />
          : (currentPatientId && __('ready')) || __('pleasePair')
      }
    </Text>
    <CameraView
      onCodeRead={handlePairingFinish}
      onScan={() => {
        NativeModules.Scanner.open((err, scanned) => {
          console.log('scanner returned', err, scanned)
        })
      }}
      onMedia={handleMedia}
      showControls={pairedTo && currentPatientId}
      {...props}
    />
  </View>

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
