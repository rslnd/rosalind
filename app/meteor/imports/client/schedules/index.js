import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { StatusBoardContainer } from './statusBoard/StatusBoardContainer'
import { TimesheetsContainer } from '../timesheets/TimesheetsContainer'
import { RequestsContainer } from './requests/RequestsContainer'
import { HolidaysContainer } from './holidays/HolidaysContainer'

const SchedulesDefault = () => <Blaze template='schedulesDefault' />
const SchedulesOverride = () => <Blaze template='schedulesOverride' />
const BusinessHours = () => <Blaze template='businessHours' />

export const Schedules = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/timesheets`} component={TimesheetsContainer} />
      <Route exact path={`${match.url}/timesheets/:dateRange`} component={TimesheetsContainer} />
      <Route exact path={`${match.url}/holidays`} component={HolidaysContainer} />
      <Route exact path={`${match.url}/requests`} component={RequestsContainer} />
      <Route exact path={`${match.url}/default`} component={SchedulesDefault} />
      <Route exact path={`${match.url}/override`} component={SchedulesOverride} />
      <Route exact path={`${match.url}/businessHours`} component={BusinessHours} />
      <Route exact path={`${match.url}/default/:username`} component={SchedulesDefault} />
      <Route path={match.url} component={StatusBoardContainer} />
    </Switch>
  </div>
)
