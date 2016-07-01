import { Meteor } from 'meteor/meteor'
import { InboundCalls } from 'api/inboundCalls'
import { InboundCallsScreen } from './InboundCallsScreen'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('inboundCalls')
  if (handle.ready()) {
    const inboundCalls = InboundCalls.find({}, { sort: { createdAt: 1 } }).fetch()
    onData(null, { inboundCalls })
  }
}

const InboundCallsContainer = composeWithTracker(composer)(InboundCallsScreen)

export { InboundCallsContainer }
