import React from 'react'
import { InboundCallsContainer } from './InboundCallsContainer'
import { NewInboundCallContainer } from './NewInboundCallContainer'
import { ResolvedScreen } from './ResolvedScreen'
import { Route } from '../layout/SafeRoute'

export const InboundCalls = ({ match }) => (
  <div>
    <Route exact path={`${match.url}/resolved`} component={ResolvedScreen} />
    <Route exact path={`${match.url}/resolved`} component={ResolvedScreen} />
    <Route path={`${match.url}/topic/:slug`} component={InboundCallsContainer} />
    <Route exact path={match.url} component={InboundCallsContainer} />
  </div>
)
