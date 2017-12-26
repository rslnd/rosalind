import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { AppointmentsContainer } from './dayView/AppointmentsContainer'
import { AppointmentsCalendarSelect } from './dayView/AppointmentsCalendarSelect'

export const Appointments = ({ match }) => (
  <div>
    <Switch>
      <Route path={`${match.url}/:calendar/:date`} component={AppointmentsContainer} />
      <Route path={`${match.url}/:calendar`} component={AppointmentsContainer} />
      <Route path={`${match.url}`} component={AppointmentsCalendarSelect} />
    </Switch>
  </div>
)
