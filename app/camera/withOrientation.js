import React from 'react'
import identity from 'lodash/identity'
import { Dimensions } from 'react-native'

export const portrait = 'portrait'
export const landscape = 'landscape'
export const both = 'both'

export const applyStyle = (props, styles, className) =>
  [
    styles[both][className],
    styles[props.orientation][className]
  ].filter(identity)

const getOrientation = (width, height) =>
  height > width
  ? portrait
  : landscape

export const withOrientation = Component =>
  class WithOrientation extends React.Component {
    constructor (props) {
      super(props)

      const { width, height } = Dimensions.get('window')

      this.state = {
        width,
        height,
        orientation: getOrientation(width, height)
      }

      this.handleChange = this.handleChange.bind(this)
    }

    handleChange (newDimensions) {
      const { window: { width, height } } = newDimensions
      const orientation = getOrientation(width, height)
      this.setState({ width, height, orientation })
    }

    componentWillMount () {
      Dimensions.addEventListener('change', this.handleChange)
    }

    componentWillUnmount () {
      Dimensions.removeEventListener('change', this.handleChange)
    }

    render () {
      const { orientation } = this.state

      return (
        <Component {...this.props} orientation={orientation} />
      )
    }
  }
