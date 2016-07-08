import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { ReportsContainer } from 'client/ui/reports'

export const ReportsRoutes = () => (
  <Route path="reports">
    <IndexRoute component={ReportsContainer} />} />
    <Route path=":date" component={ReportsContainer} />} />
  </Route>
)
