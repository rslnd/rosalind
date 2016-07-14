import { Meteor } from 'meteor/meteor'
import { InboundCalls } from 'api/inboundCalls'
import { InboundCallsScreen } from './InboundCallsScreen'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('inboundCalls')
  if (handle.ready()) {
    const inboundCalls = InboundCalls.find({}, { sort: { createdAt: 1 } }).fetch()
    const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
    const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

    onData(null, { inboundCalls, resolve, unresolve })
  }
}

export const InboundCallsContainer = composeWithTracker(composer)(InboundCallsScreen)
