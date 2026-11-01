import React, { useContext } from 'react'
import { useLocation, useParams, UNSAFE_NavigationContext } from 'react-router-dom'

// react-router 6+ removed withRouter and the history/match/location route props.
// This provides the subset of the v5 props the app still uses.
//
// The navigator from the router context is the router's own history object.
// Unlike useNavigate() it is stable and may be called during render and inside
// trackers, which several containers do (e.g. redirect after subscriptions are ready).
export const useRouterProps = () => {
  const { navigator } = useContext(UNSAFE_NavigationContext)
  const location = useLocation()
  const params = useParams()

  return {
    history: navigator,
    location,
    match: { params }
  }
}

export const withRouter = Component => {
  const WithRouterHooks = props => <Component {...props} {...useRouterProps()} />
  // recompose's toClass calls function components directly instead of rendering
  // them, so keep the hooks in a separate component that React always renders.
  const WithRouter = props => <WithRouterHooks {...props} />
  WithRouter.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`
  return WithRouter
}
