import React from 'react'
import { View, StyleSheet } from 'react-native'
import { overlayPosition } from './withModeDocument'
import { withHandlers, compose, withState } from 'recompose'

const withDimensions = compose(
  withState('dimensions', 'setDimensions'),
  withHandlers({
    handleDimensions: props => e =>
      props.setDimensions(e.nativeEvent.layout)
  })
)

export const OverlayDocument = withDimensions(({
  handleDimensions,
  dimensions
}) =>
  <View
    style={styles.container}
    onLayout={handleDimensions}>
    {
      !(dimensions)
      ? null
      : <View style={[
        styles.document,
        overlayPosition({
          width: dimensions.width,
          height: dimensions.height
        })
      ]} />
    }
  </View>
)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  document: {
    position: 'absolute',
    borderColor: 'yellow',
    borderRadius: 8,
    borderWidth: 1,
    opacity: 0.8
  }
})
