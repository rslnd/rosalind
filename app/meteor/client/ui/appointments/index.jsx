import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { AppointmentsContainer } from './dayView/AppointmentsContainer'

export const Appointments = ({ match }) => (
  <div>
    <Switch>
      <Route path={`${match.url}/:date`} component={AppointmentsContainer} />
      <Route path={match.url} component={AppointmentsContainer} />
    </Switch>
  </div>
)
