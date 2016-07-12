import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Blaze from 'meteor/gadicc:blaze-react-component'

export const UsersRoutes = () => (
  <Route path="users">
    <IndexRoute component={() => <Blaze template="users" />} />
    <Route path="new" component={() => <Blaze template="newUser" />} />
    <Route path=":id/edit" component={() => <Blaze template="editUser" />} />
  </Route>
)
