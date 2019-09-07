import React from 'react'
import FontAwesome, { SolidIcons } from 'react-native-fontawesome'

export const Icon = ({ name, style }) =>
  <FontAwesome
    style={style}
    icon={SolidIcons[name]}
  />
