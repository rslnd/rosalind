import React from 'react'
import { Error } from '../components/Error'
import { withRouter } from 'react-router-dom'

class ErrorBoundaryComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hasError: false,
      errorUrlLocation: null
    }
  }

  componentDidCatch (error, info) {
    this.setState({
      hasError: true,
      errorUrlLocation: this.props.location
    })
    // TODO: Log to sentry (error, info)
  }

  getDerivedStateFromProps (props, state) {
    console.log(props.location, state.errorUrlLocation, props.location === state.errorUrlLocation)
    if (props.location === state.errorUrlLocation) {
      return null
    } else {
      return {
        hasError: false,
        errorUrlLocation: null
      }
    }
  }

  render () {
    if (this.state.hasError) {
      return <Error />
    }
    return this.props.children
  }
}

export const ErrorBoundary = withRouter(ErrorBoundaryComponent)
