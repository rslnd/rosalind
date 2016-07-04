import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { MainLayoutContainer } from 'client/ui/layout'
import { Dashboard } from 'client/ui/dashboard/Dashboard'

import { SchedulesRoutes } from './SchedulesRoutes'
import { InboundCallsRoutes } from './InboundCallsRoutes'
import { ReportsRoutes } from './ReportsRoutes'
import { SystemRoutes } from './SystemRoutes'
import { UsersRoutes } from './UsersRoutes'

export default () => {
  render(
    <Router history={browserHistory}>
      <Route path="/" component={MainLayoutContainer}>
        <IndexRoute component={Dashboard} />
        {InboundCallsRoutes()}
        {SchedulesRoutes()}
        {ReportsRoutes()}
        {SystemRoutes()}
        {UsersRoutes()}
      </Route>
    </Router>,
    document.getElementById('react-root')
  )
}
