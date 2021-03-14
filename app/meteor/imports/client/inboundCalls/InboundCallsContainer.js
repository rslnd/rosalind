import Alert from 'react-s-alert'
import { toClass, withState, compose } from 'recompose'
import { InboundCalls, InboundCallsTopics } from '../../api/inboundCalls'
import { Patients } from '../../api/patients'
import { InboundCallsScreen } from './InboundCallsScreen'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { Comments, Users } from '../../api'
import { hasRole } from '../../util/meteor/hasRole'
import identity from 'lodash/identity'
import { filterComments } from './filterComments'
import { connect } from 'react-redux'
import { changeInputValue } from '../patients/picker/actions'

export const onSearchPatient = dispatch => (inboundCall) => {
  const partialPatientFields = {
    birthday: inboundCall.payload ? inboundCall.payload.birthdate : null,
    firstName: inboundCall.firstName,
    lastName: inboundCall.lastName,
    telephone: inboundCall.telephone,
    gender: inboundCall.payload ? inboundCall.payload.gender : null,
    titlePrepend: inboundCall.payload ? inboundCall.payload.titlePrepend : null,
  }

  dispatch(changeInputValue(partialPatientFields))
  Alert.success('Name in Suche übernommen')
}


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


  // TODO: Fix duplicate logic in ResolvedScreen
  const inboundCalls = InboundCalls.find(selector, {
    sort: { pinnedBy: -1, createdAt: 1 }
  }).fetch().map(inboundCall => {
    const rawComments = Comments.find({ docId: inboundCall._id }, { sort: { createdAt: 1 } }).fetch()

    const { comments, CommentsAction } = filterComments({
      comments: rawComments,
      Comments,
      inboundCall,
      enabled: props.isCommentFilterEnabled,
      setEnabled: props.setCommentFilterEnabled
    })

    return {
      ...inboundCall,
      canResolve: canResolve || (inboundCall.pinnedBy === userId || inboundCall.createdBy === userId),
      canEdit: canEdit || (inboundCall.createdBy === userId),
      patient: inboundCall.patientId &&
        Patients.findOne({ _id: inboundCall.patientId }),
      comments,
      CommentsAction
    }
  })

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
    const user = Users.findOne({ _id }, { removed: true })
    return user && Users.methods.fullNameWithTitle(user)
  }

  return { inboundCalls, resolve, unresolve, edit, fullNameWithTitle, topic, onSearchPatient: onSearchPatient(props.dispatch) }
}

export const InboundCallsContainer = compose(
  withState('isCommentFilterEnabled', 'setCommentFilterEnabled', true),
  connect(),
  withTracker(composer)
)(toClass(InboundCallsScreen))
