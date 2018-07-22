import { withTracker } from 'meteor/react-meteor-data'
import { toClass } from 'recompose'
import { InboundCalls } from '../../api/inboundCalls'
import { InboundCallItem } from './InboundCallItem'

const composer = (props) => {
  const inboundCall = InboundCalls.findOne({ _id: props._id })
  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

  return { inboundCall, resolve, unresolve }
}

export const InboundCallContainer = withTracker(composer)(toClass(InboundCallItem))
