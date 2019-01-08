import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { landscape, portrait, both, applyStyle } from './withOrientation'
import { Icon } from './Icon'
import { cameraMode } from './withCameraMode'

const modeIcon = {
  [cameraMode.photo]: 'camera',
  [cameraMode.document]: 'file-alt'
}

export const CameraControls = ({
  onTakePicture,
  handleNextCameraMode,
  cameraMode,
  nextCameraMode,
  ...props
}) =>
  <View style={applyStyle(props, styles, 'controlRow')}>
    <View
      style={applyStyle(props, styles, 'secondary', 'placeholder')}
      pointerEvents='none'
    />

    <TouchableOpacity onPress={onTakePicture}>
      <View style={applyStyle(props, styles, 'shutter')}>
        <Icon name={modeIcon[cameraMode]} style={styles[both].icon} />
      </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={handleNextCameraMode}>
      <View style={applyStyle(props, styles, 'secondary')}>
        <Icon name={modeIcon[nextCameraMode]} style={[
          styles[both].icon,
          styles[both].iconSecondary
        ]} />
      </View>
    </TouchableOpacity>
  </View>

const shutterSize = 130
const secondarySize = 80
const rowPadding = 15

export const rowSize = shutterSize + rowPadding

const styles = {
  [both]: StyleSheet.create({
    controlRow: {
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: rowPadding
    },
    shutter: {
      opacity: 0.8,
      backgroundColor: 'red',
      borderRadius: shutterSize,
      width: shutterSize,
      height: shutterSize,
      justifyContent: 'center',
      alignItems: 'center'
    },
    secondary: {
      opacity: 0.7,
      backgroundColor: '#333',
      borderRadius: secondarySize,
      width: secondarySize,
      height: secondarySize,
      justifyContent: 'center',
      alignItems: 'center'
    },
    placeholder: {
      opacity: 0
    },
    icon: {
      flex: 1,
      paddingTop: 33,
      paddingLeft: 1,
      fontSize: 60,
      color: 'white'
    },
    iconSecondary: {
      paddingTop: 24,
      fontSize: 30,
      marginLeft: 16,
      marginRight: 16
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
      flexDirection: 'column',
      minWidth: shutterSize,
      right: 0,
      top: 0,
      bottom: 0
    }
  })
}
