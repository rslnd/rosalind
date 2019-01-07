import React from 'react'
import { StyleSheet, View } from 'react-native'
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
      onMedia={handleMedia}
      showControls={!!pairedTo}
      {...props}
    />
  </View>

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000'
  }
})
