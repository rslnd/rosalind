import React from 'react'
import { Route } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import { useRouterProps } from '../components/withRouter'

const SafeRouteElement = ({ path, component }) => {
  const routerProps = useRouterProps()
  return <ErrorBoundary key={path} name={`SafeRoute ${path}`}>
    {React.createElement(component, routerProps)}
  </ErrorBoundary>
}

// <Routes> only accepts <Route> children, so this is a function returning one
// instead of a wrapper component. The component receives v5-style router props.
// An empty path is the index route (exact match of the parent path).
export const route = (path, component) => {
  const element = <SafeRouteElement path={path} component={component} />
  return path === ''
    ? <Route key='index' index element={element} />
    : <Route key={path} path={path} element={element} />
}
