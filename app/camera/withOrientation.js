import React from 'react'
import identity from 'lodash/identity'
import Orientation from 'react-native-orientation'

export const portrait = 'PORTRAIT'
export const landscape = 'LANDSCAPE'

export const landscapeLeft = 'LANDSCAPE-LEFT'
export const landscapeRight = 'LANDSCAPE-RIGHT'
export const portraitUpsideDown = 'PORTRAITUPSIDEDOWN'

export const both = 'both'

const specificToGeneral = s => {
  switch (s) {
    case landscapeLeft: return landscape
    case landscapeRight: return landscape
    case portrait: return portrait
    case portraitUpsideDown: return portrait
    default: return portrait
  }
}

export const applyStyle = (props, styles, className) =>
  [
    styles[both][className],
    props.orientation &&
      styles[props.orientation] &&
      styles[props.orientation][className],
    props.orientationSpecific &&
      styles[props.orientationSpecific] &&
      styles[props.orientationSpecific][className]
  ].filter(identity)

export const withOrientation = Component =>
  class WithOrientation extends React.Component {
    constructor (props) {
      super(props)

      this.handleChange = this.handleChange.bind(this)
    }

    handleChange (orientationSpecific) {
      const orientation = specificToGeneral(orientationSpecific)
      this.setState({ orientation, orientationSpecific })
    }

    componentWillMount () {
      const orientation = Orientation.getInitialOrientation()
      this.setState({ orientation, orientationSpecific: orientation })
    }

    componentDidMount () {
      Orientation.addSpecificOrientationListener(this.handleChange)
      Orientation.unlockAllOrientations()
    }

    componentWillUnmount () {
      Orientation.removeSpecificOrientationListener(this.handleChange)
    }

    render () {
      const { orientation, orientationSpecific } = this.state

      return (
        <Component
          {...this.props}
          orientation={orientation}
          orientationSpecific={orientationSpecific}
        />
      )
    }
  }
