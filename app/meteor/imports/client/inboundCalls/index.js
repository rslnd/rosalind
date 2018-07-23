import React from 'react'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { InboundCallsContainer } from './InboundCallsContainer'
import { NewInboundCallContainer } from './NewInboundCallContainer'
import { Route } from '../layout/SafeRoute'

// This is used by Blaze in commentsModal
export { InboundCallContainer } from './InboundCallContainer'

const InboundCallsResolved = () => <Blaze template='inboundCallsResolved' />

export const InboundCalls = ({ match }) => (
  <div>
    <Route exact path={`${match.url}/resolved`} component={InboundCallsResolved} />
    <Route exact path={`${match.url}/new`} component={NewInboundCallContainer} />
    <Route exact path={match.url} component={InboundCallsContainer} />
  </div>
)
