import React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
import { withOrientation, landscape, portrait, both, applyStyle } from './withOrientation'

export const CameraControls = withOrientation(props =>
  <View style={applyStyle(props, styles, 'controlRow')}>
    <TouchableOpacity onPress={props.onTakePicture}>
      <View style={applyStyle(props, styles, 'shutter')} />
    </TouchableOpacity>
  </View>
)

const shutterSize = 130

const styles = {
  [both]: StyleSheet.create({
    controlRow: {
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15
    },
    shutter: {
      backgroundColor: 'red',
      borderRadius: shutterSize,
      width: shutterSize,
      height: shutterSize
    }
  }),
  [portrait]: StyleSheet.create({
    controlRow: {
      minHeight: shutterSize,
      left: 0,
      right: 0,
      bottom: 0
    }
  }),
  [landscape]: StyleSheet.create({
    controlRow: {
      minWidth: shutterSize,
      right: 0,
      top: 0,
      bottom: 0
    }
  })
}
