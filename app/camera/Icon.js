import React from 'react'
import FontAwesome, { Icons } from 'react-native-fontawesome'

export const Icon = ({ name, style }) =>
  <FontAwesome
    style={style}>
    {Icons[name]}
  </FontAwesome>
