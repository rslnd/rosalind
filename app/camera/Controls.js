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

    {
      onScan
        ? <Button
          secondary
          icon='file-alt'
          onPress={onScan}
        />
        : <Placeholder />
    }
  </View>

const Button = ({ primary, onPress, icon, ...props }) =>
  <TouchableOpacity onPress={onPress}>
    <View style={applyStyle(props, styles, primary ? 'primaryArea' : 'secondaryArea')}>
      <View style={applyStyle(props, styles, primary ? 'primary' : 'secondary')}>
        <Icon name={icon} style={[
          styles[both].icon,
          !primary ? styles[both].iconSecondary : {}
        ]} />
      </View>
    </View>
  </TouchableOpacity>

const Placeholder = props =>
  <View
    style={[styles[both].secondary, styles[both].placeholder]}
    pointerEvents='none'
  />

const primarySize = 90
const secondarySize = 60
const rowPadding = 15
const touchableAreaMultiplier = 1.6

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
    primaryArea: {
      width: primarySize * touchableAreaMultiplier,
      height: primarySize * touchableAreaMultiplier,
      justifyContent: 'center',
      alignItems: 'center'
    },
    primary: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: primarySize,
      width: primarySize,
      height: primarySize,
      justifyContent: 'center',
      alignItems: 'center'
    },
    secondayArea: {
      width: secondarySize * touchableAreaMultiplier,
      height: secondarySize * touchableAreaMultiplier,
      justifyContent: 'center',
      alignItems: 'center'
    },
    secondary: {
      backgroundColor: 'rgba(180,180,180,0.6)',
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
      paddingTop: 22,
      paddingLeft: 1,
      fontSize: 40,
      color: 'rgba(0,0,0,0.8)'
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
      minHeight: primarySize * touchableAreaMultiplier,
      left: 0,
      right: 0,
      bottom: 0
    }
  }),
  [landscape]: StyleSheet.create({
    controlRow: {
      flexDirection: 'column',
      minWidth: primarySize * touchableAreaMultiplier,
      right: 0,
      top: 0,
      bottom: 0
    }
  })
}
