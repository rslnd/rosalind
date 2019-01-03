import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { CameraView } from './CameraView'

export const MainView = ({
  handlePairingFinish,
  handleMedia,
  pairedTo
}) =>
  <View style={styles.container}>
    <CameraView
      onCodeRead={handlePairingFinish}
      onMedia={handleMedia}
      showControls={!!pairedTo}
    />
    {/* <Text style={styles.text}>
      ClientKey: {clientKey}
    </Text> */}
  </View>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc'
  },
  text: {
    color: '#FFF'
  },
  camera: {
    width: '100%',
    height: '100%'
  }
})
