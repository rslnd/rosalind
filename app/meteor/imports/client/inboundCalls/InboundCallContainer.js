import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { InboundCalls } from '../../api/inboundCalls'
import { InboundCallItem } from './InboundCallItem'
import { hasRole } from '../../util/meteor/hasRole'
import { Meteor } from 'meteor/meteor'
import { Users } from '../../api/users'

const composer = (props) => {
  const inboundCall = InboundCalls.findOne({ _id: props._id }, { removed: true })
  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })
  const fullNameWithTitle = _id => {
    const user = Users.findOne({ _id })
    return user && Users.methods.fullNameWithTitle(user)
  }

  if (!inboundCall) {
    return {
      isLoading: true
    }
  } else {
    const canResolve = (inboundCall.pinnedBy === Meteor.userId()) ||
      hasRole(Meteor.userId(), ['admin', 'inboundCalls-pin'])

    return { ...props, inboundCall, resolve, unresolve, canResolve, fullNameWithTitle }
  }
}

export const InboundCallContainer = withTracker(composer)(toClass(InboundCallItem))
