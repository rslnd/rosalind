import moment from 'moment-timezone'
import { toClass } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { InboundCalls } from '../../api/inboundCalls'
import { Loading } from '../components/Loading'
import { InboundCallsScreen } from './InboundCallsScreen'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props, onData) => {
  const handle = subscribe('inboundCalls')
  if (handle.ready()) {
    const inboundCalls = InboundCalls.find({}, { sort: { createdAt: 1 } }).fetch()
    const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
    const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

    onData(null, { inboundCalls, resolve, unresolve })
  }
}

export const InboundCallsContainer = composeWithTracker(composer, Loading)(toClass(InboundCallsScreen))
