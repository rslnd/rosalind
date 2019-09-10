import React from 'react'
import { StyleSheet, View, NativeModules, NativeEventEmitter } from 'react-native'
import { CameraView } from './CameraView'

// NativeModules.Scanner.initialize()
// const scannerEmitter = new NativeEventEmitter(NativeModules.Scanner)
// scannerEmitter.addListener('Scan', scan => console.log('got scan event', scan))

export const MainView = ({
  handlePairingFinish,
  handleMedia,
  pairedTo,
  ...props
}) =>
  <View style={styles.container}>
    <CameraView
      onCodeRead={handlePairingFinish}
      // onScan={() => {
      //   NativeModules.Scanner.open()
      // }}
      onMedia={handleMedia}
      showControls={!!pairedTo}
      {...props}
    />
  </View>

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc'
  }
})
