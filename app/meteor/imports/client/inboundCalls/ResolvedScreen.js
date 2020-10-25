import React, { useState } from 'react'
import debounce from 'lodash/debounce'
import flatten from 'lodash/flatten'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'
import { compose, withHandlers, withState } from 'recompose'
import { connect } from 'react-redux'
import { InboundCalls } from '../../api/inboundCalls'
import TextField from '@material-ui/core/TextField'
import { InboundCallsList } from './InboundCallsScreen'
import { __ } from '../../i18n'
import { ContentHeader } from '../components/ContentHeader'
import { PatientPicker } from '../patients/picker'

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

  const inboundCalls = InboundCalls.find(selector, {
    sort: {
      removedAt: -1
    },
    removed: true,
    limit: 30
  }).fetch()

  const isLoadingCalls = (subscription && !subscription.ready()) && inboundCalls.length === 0

  const resolve = (_id) => InboundCalls.methods.resolve.call({ _id })
  const unresolve = (_id) => InboundCalls.methods.unresolve.call({ _id })
  const edit = (_id, field) => value =>
    InboundCalls.methods.edit.call({ _id, [field]: value })

  return {
    isLoadingCalls,
    inboundCalls,
    resolve,
    unresolve,
    edit,
    patient
  }
}

const ResolvedScreenComponent = ({ setPatientId, patientId, handleQueryChange, query, isLoadingCalls, inboundCalls, resolve, unresolve, edit }) =>
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
