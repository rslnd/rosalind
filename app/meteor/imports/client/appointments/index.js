import React from 'react'
import { Switch } from 'react-router-dom'
import { AppointmentsContainer } from './day/AppointmentsContainer'
import { AppointmentsContainer as OldAppointmentsContainer } from './dayView/AppointmentsContainer'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { Route } from '../layout/SafeRoute'

export const Appointments = ({ match }) => (
  <Switch>
    <Route path={`${match.url}/day/:calendar/:date`} component={AppointmentsContainer} />
    <Route path={`${match.url}/day/:calendar`} component={AppointmentsContainer} />
    <Route path={`${match.url}/:calendar/:date`} component={OldAppointmentsContainer} />
    <Route path={`${match.url}/:calendar`} component={OldAppointmentsContainer} />
    <Route path={`${match.url}`} component={Select} />
  </Switch>
)

const Select = () =>
  <CalendarSelect basePath='appointments' />
