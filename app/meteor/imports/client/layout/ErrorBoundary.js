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

  static getDerivedStateFromProps (props, state) {
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
      return this.props.silent
        ? null
        : <Error />
    }
    return this.props.children
  }
}

export const ErrorBoundary = withRouter(ErrorBoundaryComponent)

export const withErrorBoundary = Component => props =>
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
