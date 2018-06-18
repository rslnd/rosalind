import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { ReportsContainer } from './ReportsContainer'
import { AssigneeReportContainer } from './AssigneeReportContainer'

export const Reports = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/day/:date`} component={ReportsContainer} />
      <Route exact path={`${match.url}/day`} component={ReportsContainer} />
      <Route exact path={`${match.url}/assignee/:username`} component={AssigneeReportContainer} />
      <Route exact path={`${match.url}/assignee`} component={AssigneeReportContainer} />
      <Route path={match.url} component={ReportsContainer} />
    </Switch>
  </div>
)
