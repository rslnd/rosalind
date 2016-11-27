import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { InboundCalls } from 'api/inboundCalls'
import { InboundCallItem } from './InboundCallItem'

const composer = (props, onData) => {
  const inboundCall = InboundCalls.findOne({ _id: props._id })
  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

  onData(null, { inboundCall, resolve, unresolve })
}

export const InboundCallContainer = composeWithTracker(composer)(InboundCallItem)
