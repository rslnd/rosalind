import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { ReportsContainer } from './ReportsContainer'
import { AssigneeReportContainer } from './AssigneeReportContainer'

export const Reports = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/assignees/:username`} component={AssigneeReportContainer} />
      <Route exact path={`${match.url}/:date`} component={ReportsContainer} />
      <Route path={match.url} component={ReportsContainer} />
    </Switch>
  </div>
)
