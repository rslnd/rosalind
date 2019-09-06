import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { landscape, portrait, both, applyStyle } from './withOrientation'
import { Icon } from './Icon'

export const Controls = ({
  onTakePicture,
  onScan,
  ...props
}) =>
  <View style={applyStyle(props, styles, 'controlRow')}>
    <Placeholder />

    <Button
      primary
      icon='camera'
      onPress={onTakePicture}
    />

    <Button
      secondary
      icon='file-alt'
      onPress={onScan}
    />
  </View>

const Button = ({ primary, onPress, icon, ...props }) =>
  <TouchableOpacity onPress={onPress}>
    <View style={applyStyle(props, styles, primary ? 'primary' : 'secondary')}>
      <Icon name={icon} style={[
        styles[both].icon,
        !primary ? styles[both].iconSecondary : {}
      ]} />
    </View>
  </TouchableOpacity>

const Placeholder = props =>
  <View
    style={[styles[both].secondary, styles[both].placeholder]}
    pointerEvents='none'
  />

const primarySize = 130
const secondarySize = 80
const rowPadding = 15

export const rowSize = primarySize + rowPadding

const styles = {
  [both]: StyleSheet.create({
    controlRow: {
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: rowPadding
    },
    primary: {
      opacity: 0.8,
      backgroundColor: 'red',
      borderRadius: primarySize,
      width: primarySize,
      height: primarySize,
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
      minHeight: primarySize,
      left: 0,
      right: 0,
      bottom: 0
    }
  }),
  [landscape]: StyleSheet.create({
    controlRow: {
      flexDirection: 'column',
      minWidth: primarySize,
      right: 0,
      top: 0,
      bottom: 0
    }
  })
}
