import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { InboundCallsContainer } from 'client/ui/inboundCalls'

export const InboundCallsRoutes = () => (
  <Route path="inboundCalls">
    <IndexRoute component={InboundCallsContainer} />
    <Route path="new" component={() => <Blaze template="newInboundCall" />} />
    <Route path="resolved" component={() => <Blaze template="inboundCallsResolved" />} />
  </Route>
)
