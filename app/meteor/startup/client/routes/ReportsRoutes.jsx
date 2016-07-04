import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Blaze from 'meteor/gadicc:blaze-react-component'

export const ReportsRoutes = () => (
  <Route path="reports">
    <IndexRoute component={() => <Blaze template="reports" />} />
    <Route path=":date" component={() => <Blaze template="reports" />} />
  </Route>
)
