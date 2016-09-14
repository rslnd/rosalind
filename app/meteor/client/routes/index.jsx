import React from 'react'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { MainLayoutContainer } from 'client/ui/layout'
import { Dashboard } from 'client/ui/dashboard/Dashboard'

import { AppointmentsRoutes } from './AppointmentsRoutes'
import { SchedulesRoutes } from './SchedulesRoutes'
import { InboundCallsRoutes } from './InboundCallsRoutes'
import { ReportsRoutes } from './ReportsRoutes'
import { SystemRoutes } from './SystemRoutes'
import { UsersRoutes } from './UsersRoutes'

export default () => (
  <Router history={browserHistory}>
    <Route path="/" component={MainLayoutContainer}>
      <IndexRoute component={Dashboard} />
      {AppointmentsRoutes()}
      {InboundCallsRoutes()}
      {SchedulesRoutes()}
      {ReportsRoutes()}
      {SystemRoutes()}
      {UsersRoutes()}
    </Route>
  </Router>
)
