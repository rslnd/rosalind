import { toClass } from 'recompose'
import { InboundCalls, InboundCallsTopics } from '../../api/inboundCalls'
import { Patients } from '../../api/patients'
import { InboundCallsScreen } from './InboundCallsScreen'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { Comments, Users } from '../../api'
import { hasRole } from '../../util/meteor/hasRole'
import identity from 'lodash/identity'

const composer = (props) => {
  const handle = subscribe('inboundCalls')
  if (!handle.ready()) {
    return {
      isLoading: true
    }
  }

  const userId = Meteor.userId()
  const canResolve = hasRole(userId, ['admin', 'inboundCalls-pin'])
  const canEdit = hasRole(userId, ['admin', 'inboundCalls-edit'])

  const topic = props.match.params.slug &&
    InboundCallsTopics.findOne({ slug: props.match.params.slug })

  const hasTopicsDefined = InboundCallsTopics.find({}).count() > 0
  const selector = (hasTopicsDefined && topic)
    ? { topicId: topic._id }
    : hasTopicsDefined
      ? { topicId: null }
      : {}

  const inboundCalls = InboundCalls.find(selector, {
    sort: { pinnedBy: -1, createdAt: 1 }
  }).fetch().map(inboundCall => ({
    ...inboundCall,
    canResolve: canResolve || (inboundCall.pinnedBy === userId || inboundCall.createdBy === userId),
    canEdit: canEdit || (inboundCall.createdBy === userId),
    patient: inboundCall.patientId &&
      Patients.findOne({ _id: inboundCall.patientId }),
    comments: Comments.find({ docId: inboundCall._id }, { sort: { createdAt: 1 } }).fetch()
  }))

  const appointmentIds = inboundCalls.map(c => c.appointmentId).filter(identity)
  if (appointmentIds.length >= 1) {
    subscribe('appointments', {
      appointmentIds: appointmentIds
    })
  }

  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })
  const edit = (_id, field) => value =>
    InboundCalls.methods.edit.call({ _id, [field]: value })
  const fullNameWithTitle = _id => {
    const user = Users.findOne({ _id })
    return user && Users.methods.fullNameWithTitle(user)
  }

  return { inboundCalls, resolve, unresolve, edit, fullNameWithTitle, topic }
}

export const InboundCallsContainer = withTracker(composer)(toClass(InboundCallsScreen))
