import React from 'react'
import { Switch } from 'react-router-dom'
import { ReportsContainer } from './ReportsContainer'
import { AssigneeReportContainer } from './AssigneeReportContainer'
import { ReferralsReportContainer } from './ReferralsReportContainer'
import { Route } from '../layout/SafeRoute'

export const Reports = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/day/:date`} component={ReportsContainer} />
      <Route exact path={`${match.url}/day`} component={ReportsContainer} />
      <Route exact path={`${match.url}/assignee/:username`} component={AssigneeReportContainer} />
      <Route exact path={`${match.url}/assignee`} component={AssigneeReportContainer} />
      <Route exact path={`${match.url}/referrals`} component={ReferralsReportContainer} />
      <Route exact path={`${match.url}/referrals/:username`} component={ReferralsReportContainer} />
      <Route path={match.url} component={ReportsContainer} />
    </Switch>
  </div>
)
