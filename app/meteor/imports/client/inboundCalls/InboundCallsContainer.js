import moment from 'moment-timezone'
import { toClass } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { InboundCalls } from '../../api/inboundCalls'
import { Loading } from '../components/Loading'
import { InboundCallsScreen } from './InboundCallsScreen'
import { withTracker } from 'meteor/react-meteor-data'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  const handle = subscribe('inboundCalls')
  if (handle.ready()) {
    const inboundCalls = InboundCalls.find({}, { sort: { createdAt: 1 } }).fetch()
    const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
    const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

    return { inboundCalls, resolve, unresolve }
  }
}

export const InboundCallsContainer = withTracker(composer)(toClass(InboundCallsScreen))
