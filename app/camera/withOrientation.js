import React from 'react'
import identity from 'lodash/identity'

export const portrait = 'PORTRAIT'
export const landscape = 'LANDSCAPE'

export const landscapeLeft = 'LANDSCAPE-LEFT'
export const landscapeRight = 'LANDSCAPE-RIGHT'
export const portraitUpsideDown = 'PORTRAITUPSIDEDOWN'

export const both = 'both'

const mapOrientation = (current, last) => {
  switch (current) {
    case landscapeLeft: return [landscape, landscapeLeft]
    case landscapeRight: return [landscape, landscapeRight]
    case portrait: return [portrait, portrait]
    case portraitUpsideDown: return last
    default: return last || [portrait, portrait]
  }
}

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

export const withOrientation = Component =>
  class WithOrientation extends React.Component {
    constructor (props) {
      super(props)

      this.state = {
        orientation: [portrait, portrait]
      }

      this.handleChange = this.handleChange.bind(this)
      this.handleOrientationLock = this.handleOrientationLock.bind(this)
      this.handleOrientationUnlock = this.handleOrientationUnlock.bind(this)
    }

    handleChange (newSpecific) {
      const lastOrientation = this.state.orientation
      const orientation = mapOrientation(newSpecific, lastOrientation)

      if (this.state.locked &&
        this.state.locked[0] !== orientation[0]) {
        return
      }

      console.log('Orientation change', orientation)
      this.setState({ orientation })
    }

    handleOrientationLock (forcedOrientation) {
      if (!forcedOrientation) {
        forcedOrientation = this.state.orientation && this.state.orientation[0]
      }

      this.setState({
        locked: forcedOrientation
      })

      switch (forcedOrientation) {
        // case landscape: return Orientation.lockToLandscape()
        // case landscapeLeft: return Orientation.lockToLandscapeLeft()
        // case landscapeRight: return Orientation.lockToLandscapeRight()
        // default: return Orientation.lockToPortrait()
      }
    }

    handleOrientationUnlock () {
      this.setState({
        locked: null
      })

      // Orientation.unlockAllOrientations()
    }

    componentDidMount () {
    // const orientation = mapOrientation(Orientation.getInitialOrientation())
    // this.setState({ orientation })

    //   Orientation.addSpecificOrientationListener(this.handleChange)
    //   Orientation.unlockAllOrientations()
    }

    componentWillUnmount () {
      // Orientation.removeSpecificOrientationListener(this.handleChange)
    }

    render () {
      const { orientation } = this.state

      return (
        <Component
          {...this.props}
          handleOrientationLock={this.handleOrientationLock}
          handleOrientationUnlock={this.handleOrientationUnlock}
          orientation={orientation}
        />
      )
    }
  }
