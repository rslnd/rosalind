import { Meteor } from 'meteor/meteor'
import { InboundCalls } from 'api/inboundCalls'
import { InboundCallsScreen } from './InboundCallsScreen'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('inboundCalls')
  if (handle.ready()) {
    const inboundCalls = InboundCalls.find({}, { sort: { createdAt: 1 } }).fetch()
    const resolve = (_id) => Meteor.call('inboundCalls/resolve', _id)
    const unresolve = (_id) => Meteor.call('inboundCalls/unresolve', _id)

    onData(null, { inboundCalls, resolve, unresolve })
  }
}

const InboundCallsContainer = composeWithTracker(composer)(InboundCallsScreen)

export { InboundCallsContainer }
