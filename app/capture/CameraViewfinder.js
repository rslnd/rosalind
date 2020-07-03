import React from 'react'
import { StyleSheet, View } from 'react-native'

export const CameraViewfinder = ({ position }) => {
  let style = [styles.finder, styles.inactive]

  if (position) {
    const offset = (size / 2)
    const positionStyle = {
      left: position.x - offset,
      top: position.y - offset
    }

    style = [styles.finder, styles.active, positionStyle]
  }

  return <View style={style} />
}

const size = 100

const styles = StyleSheet.create({
  finder: {
    width: size,
    height: size,
    borderColor: 'yellow',
    borderWidth: 1
  },
  inactive: {
    opacity: 0
  },
  active: {
    opacity: 0.8
  }
})
