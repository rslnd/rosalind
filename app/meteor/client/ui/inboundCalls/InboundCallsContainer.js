import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { Counts } from 'meteor/tmeasday:publish-counts'
import { InboundCalls } from 'api/inboundCalls'
import { Loading } from 'client/ui/components/Loading'
import { InboundCallsScreen } from './InboundCallsScreen'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('inboundCalls')
  if (handle.ready()) {
    const inboundCalls = InboundCalls.find({}, { sort: { createdAt: 1 } }).fetch()
    const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
    const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })

    const resolvedTodayCount = Counts.get('inboundCalls-resolvedToday')
    const isLate = moment().hour() >= 17
    const showEncouragement = isLate && resolvedTodayCount > 30

    onData(null, { inboundCalls, resolve, unresolve, showEncouragement })
  }
}

export const InboundCallsContainer = composeWithTracker(composer, Loading)(InboundCallsScreen)
