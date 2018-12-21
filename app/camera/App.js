import React from 'react'
import { StyleSheet, View } from 'react-native'
import { CameraView } from './CameraView'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    this.handlePair = this.handlePair.bind(this)
  }

  handlePair (code) {
    console.log('Pairing to', code)
  }

  render () {
    return (
      <View style={styles.container}>
        <CameraView
          onCodeRead={this.handlePair}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    color: '#FFF'
  },
  camera: {
    width: '100%',
    height: '100%'
  }
})
