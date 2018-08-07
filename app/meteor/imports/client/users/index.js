import React from 'react'
import { Switch } from 'react-router-dom'
import { UsersContainer } from './UsersContainer'
import { Route } from '../layout/SafeRoute'
import { EditUserContainer } from './EditUserContainer'

export const Users = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/:id/edit`} component={EditUserContainer} />
      <Route path={`${match.url}`} component={UsersContainer} />
    </Switch>
  </div>
)
