import React from 'react'
import { Error } from '../components/Error'
import { withRouter } from 'react-router-dom'

class ErrorBoundaryComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: false,
      errorUrlLocation: null
    }
  }

  componentDidCatch (errorObject, info) {
    const message = `${JSON.stringify(errorObject, null, 2)}\n${JSON.stringify(this.props.location, null, 2)}`
    console.error(`ErrorBoundary: ${message}`)

    this.setState({
      error: message,
      errorUrlLocation: this.props.location
    })
  }

  static getDerivedStateFromProps (props, state) {
    if (props.location === state.errorUrlLocation) {
      return null
    } else {
      return {
        error: false,
        errorUrlLocation: null
      }
    }
  }

  render () {
    if (this.state.error) {
      return this.props.silent
        ? null
        : <Error message={this.state.error} />
    }
    return this.props.children
  }
}

export const ErrorBoundary = withRouter(ErrorBoundaryComponent)

export const withErrorBoundary = Component => props =>
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
