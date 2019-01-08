import React from 'react'
import { View, StyleSheet } from 'react-native'
import { landscape, portrait, both, applyStyle } from './withOrientation'
import { rowSize as controlsSize } from './CameraControls'

const aspectRatio = 1 / Math.sqrt(2)

export const OverlayDocument = props =>
  <View style={applyStyle(props, styles, 'container')}>
    <View style={applyStyle(props, styles, 'document')} />
  </View>

const styles = {
  [both]: StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    document: {
      flex: 1,
      aspectRatio,
      margin: 30,
      borderColor: 'yellow',
      borderRadius: 8,
      borderWidth: 1,
      opacity: 0.8
    }
  }),
  [portrait]: StyleSheet.create({
    container: {
      bottom: controlsSize
    }
  }),
  [landscape]: StyleSheet.create({
    document: {
      aspectRatio: 1 / aspectRatio
    },
    container: {
      right: controlsSize
    }
  })
}
