import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { AppointmentsContainer } from 'client/ui/appointments'

export const AppointmentsRoutes = () => (
  <Route path="appointments">
    <IndexRoute component={AppointmentsContainer} />
    <Route path=":date" component={AppointmentsContainer} />} />
  </Route>
)
