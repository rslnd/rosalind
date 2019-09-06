import React from 'react'
import { StyleSheet, View, Text, NativeModules } from 'react-native'
import { CameraView } from './CameraView'

export const MainView = ({
  handlePairingFinish,
  handleMedia,
  pairedTo,
  ...props
}) =>
  <View style={styles.container}>
    <CameraView
      onCodeRead={handlePairingFinish}
      onScan={() => NativeModules.Scanner.open()}
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
  },
  text: {
    color: '#fff',
    width: '50%',
    height: '50%',
    backgroundColor: '#ffbb55'
  },
  scannerView: {
    width: '50%',
    height: '50%',
    backgroundColor: 'red'
  }
})
