import React from 'react'
import { Switch } from 'react-router-dom'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { UsersContainer } from './UsersContainer'
import { Route } from '../layout/SafeRoute'

const NewUser = () => <Blaze template='newUser' />
const EditUser = () => <Blaze template='editUser' />

export const Users = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/new`} component={NewUser} />
      <Route exact path={`${match.url}/:id/edit`} component={EditUser} />
      <Route path={`${match.url}`} component={UsersContainer} />
    </Switch>
  </div>
)
