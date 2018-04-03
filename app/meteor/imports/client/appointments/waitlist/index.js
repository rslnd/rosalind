import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { WaitlistContainer } from './WaitlistContainer'

export const Waitlist = ({ match }) => (
  <Switch>
    <Route path={`${match.url}/:username`} component={WaitlistContainer} />
    <Route path={`${match.url}`} component={WaitlistContainer} />
  </Switch>
)
