import React from 'react'
import { Route as PlainRoute } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'

export const Route = ({ component, ...routeProps }) =>
  <PlainRoute {...routeProps} render={(props) =>
    <ErrorBoundary key={routeProps.path} name={`SafeRoute ${routeProps.path}`}>
      {React.createElement(component, props)}
    </ErrorBoundary>}
  />
