import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { MainLayoutContainer } from 'client/ui/layout'
import { Dashboard } from 'client/ui/dashboard/Dashboard'
import { InboundCallsContainer, NewInboundCallContainer, InboundCallsResolvedContainer } from 'client/ui/inboundCalls'

export default () => {
  render(
    <Router history={browserHistory}>
      <Route path="/" component={MainLayoutContainer}>
        <IndexRoute component={Dashboard} />
        <Route path="inboundCalls">
          <IndexRoute component={InboundCallsContainer} />
          <Route path="new" component={NewInboundCallContainer} />
          <Route path="resolved" component={InboundCallsResolvedContainer} />
        </Route>
      </Route>
    </Router>,
    document.getElementById('react-root')
  )
}
