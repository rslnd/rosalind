import React from 'react'
import { Switch } from 'react-router-dom'
import { WaitlistContainer } from './WaitlistContainer'
import { Route } from '../../layout/SafeRoute'

export const Waitlist = ({ match }) => (
  <Switch>
    <Route path={`${match.url}/:username`} component={WaitlistContainer} />
    <Route path={`${match.url}`} component={WaitlistContainer} />
  </Switch>
)
