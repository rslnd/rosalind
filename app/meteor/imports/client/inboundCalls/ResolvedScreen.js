import React, { useState } from 'react'
import debounce from 'lodash/debounce'
import flatten from 'lodash/flatten'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { compose, withHandlers, withState } from 'recompose'
import { connect } from 'react-redux'
import { InboundCalls, InboundCallsTopics } from '../../api/inboundCalls'
import TextField from '@material-ui/core/TextField'
import { InboundCallsList } from './InboundCallsScreen'
import { __ } from '../../i18n'
import { ContentHeader } from '../components/ContentHeader'
import { PatientPicker } from '../patients/picker'
import identity from 'lodash/identity'
import { hasRole } from '../../util/meteor/hasRole'
import { Comments, Patients, Users } from '../../api'

const debouncedSubscribe = debounce(subscribe, 150)

const composer = ({ patient, query = '' }) => {
  const subscription = debouncedSubscribe('inboundCalls-resolved', { query })

  const selector =
    query && query.length > 2
      ? {
        $or: flatten(query.split(' ').map(word => [
          { lastName: { $regex: '^' + word, $options: 'i' } },
          { note: { $regex: word, $options: 'i' } },
          { telephone: { $regex: word, $options: 'i' } },
          { firstName: { $regex: '^' + word, $options: 'i' } }
        ]))
      } : (patient
        ? { patientId: (patient.patientId || patient._id) }
        : { removed: true })

  // TODO: Fix duplicate logic in InboundCallsContainer
  const userId = Meteor.userId()
  const canResolve = hasRole(userId, ['admin', 'inboundCalls-pin'])
  const canEdit = hasRole(userId, ['admin', 'inboundCalls-edit'])

  const inboundCalls = InboundCalls.find(selector, {
    sort: {
      removedAt: -1
    },
    removed: true,
    limit: 30
  }).fetch().map(inboundCall => ({
    ...inboundCall,
    canResolve: canResolve || (inboundCall.pinnedBy === userId || inboundCall.createdBy === userId),
    canEdit: canEdit || (inboundCall.createdBy === userId),
    patientId: (inboundCall.patientId || (inboundCall.payload && inboundCall.payload.patientId)),
    patient: (inboundCall.patientId || (inboundCall.payload && inboundCall.payload.patientId)) &&
      Patients.findOne({ _id: (inboundCall.patientId || (inboundCall.payload && inboundCall.payload.patientId)) }),
    comments: Comments.find({ docId: inboundCall._id }, { sort: { createdAt: 1 } }).fetch(),
    topic: inboundCall.topicId && InboundCallsTopics.findOne({ _id: inboundCall.topicId })
  }))

  const appointmentIds = inboundCalls.map(c => c.appointmentId).filter(identity)
  if (appointmentIds.length >= 1) {
    subscribe('appointments', {
      appointmentIds: appointmentIds
    })
  }

  const patientIds = inboundCalls.map(c => c.patientId).filter(identity)
  if (patientIds.length >= 1) {
    subscribe('patients-name', {
      patientIds: patientIds
    })
  }

  const isLoadingCalls = (subscription && !subscription.ready()) && inboundCalls.length === 0

  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })
  const edit = (_id, field) => value =>
    InboundCalls.methods.edit.call({ _id, [field]: value })
  const fullNameWithTitle = _id => {
    const user = Users.findOne({ _id }, { removed: true })
    return user && Users.methods.fullNameWithTitle(user)
  }

  return {
    isLoadingCalls,
    inboundCalls,
    resolve,
    unresolve,
    edit,
    patient,
    fullNameWithTitle
  }
}

const ResolvedScreenComponent = ({ setPatientId, patientId, fullNameWithTitle, handleQueryChange, query, isLoadingCalls, inboundCalls, resolve, unresolve, edit }) =>
  <div>
    <ContentHeader title={__('inboundCalls.thisResolved')} />
    <div className='content'>
      <PatientPicker />

      <TextField
        value={query}
        onChange={handleQueryChange}
        label='Suche'
        fullWidth
        style={searchStyle}
      />

      <InboundCallsList
        isLoading={isLoadingCalls}
        inboundCalls={inboundCalls}
        resolve={resolve}
        unresolve={unresolve}
        edit={edit}
        fullNameWithTitle={fullNameWithTitle}
      />
    </div>
  </div>

const searchStyle = {
  marginBottom: 30
}

export const ResolvedScreen = compose(
  connect(state => ({
    patient: state.patientPicker.patient
  })),
  withState('query', 'changeQuery', ''),
  withHandlers({
    handleQueryChange: props => e => props.changeQuery(e.target.value)
  }),
  withTracker(composer)
)(ResolvedScreenComponent)
