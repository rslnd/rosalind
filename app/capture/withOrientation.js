import React from 'react'
import { Dimensions } from 'react-native'
import identity from 'lodash/identity'

export const portrait = 'PORTRAIT'
export const landscape = 'LANDSCAPE'

export const landscapeLeft = 'LANDSCAPE-LEFT'
export const landscapeRight = 'LANDSCAPE-RIGHT'
export const portraitUpsideDown = 'PORTRAITUPSIDEDOWN'

export const both = 'both'

export const applyStyle = (props, styles, ...classNames) =>
  classNames.map(className => [
    styles[both][className],
    props.orientation &&
      styles[props.orientation[0]] &&
      styles[props.orientation[0]][className],
    props.orientation &&
      styles[props.orientation[1]] &&
      styles[props.orientation[1]][className]
  ].filter(identity)).filter(identity)

const mapDimensions = ({ width, height }) =>
  width > height ? [landscape, landscapeRight] : [portrait, portrait]

export const withOrientation = Component =>
  class WithOrientation extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        orientation: mapDimensions(Dimensions.get('window'))
      }

      this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount () {
      Dimensions.addEventListener('change', this.handleChange)
    }

    handleChange ({ window }) {
      this.setState({
        orientation: mapDimensions(window)
      })
    }

    render () {
      return (
        <Component
          {...this.props}
          orientation={this.state.orientation}
        />
      )
    }
  }
