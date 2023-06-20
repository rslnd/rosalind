import React from 'react'
import { withTracker } from '../../components/withTracker'
import { compose, withState } from 'recompose'
import { subscribe } from '../../../util/meteor/subscribe'
import { dateToDay } from '../../../util/time/day'
import { Appointments, Patients, Users } from '../../../api'
import moment from 'moment-timezone'
import { PatientName } from '../../patients/PatientName'
import { fullNameWithTitle } from '../../../api/users/methods'
import { __ } from '../../../i18n'
import { connect } from 'react-redux'
import { hasRole } from '../../../util/meteor/hasRole'
import { Meteor } from 'meteor/meteor'
import { Box } from '../../components/Box'
import { sortBy } from 'lodash'
import { Icon } from '../../components/Icon'
import { Checkbox, FormControlLabel } from '@material-ui/core'

const composer = props => {
  const { dispatch, calendarId, date, showAll, setShowAll } = props
  const startOfDay = moment(date).clone().startOf('day').toDate()
  const endOfDay = moment(date).clone().endOf('day').toDate()
  const day = dateToDay(date)

  const canView = hasRole(Meteor.userId(), ['appointments-removed'])

  subscribe('appointments-day-removed', { ...day, calendarId })

  const appointments = Appointments.find({
    calendarId,
    start: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    removed: true,
    type: (showAll || window.rdebug) ? {$ne: 'unused-value-to-show-all-including-bookables'} : { $ne: 'bookable' }
  }, {
    removed: true,
    sort: {
      removedAt: 1
    }
  }).fetch()

  const getPatient = _id => Patients.findOne({ _id })
  const fullName = _id => {
    if (_id) {
      const user = Users.findOne({ _id }, { removed: true })
      if (user) {
        return fullNameWithTitle(user)
      }
    }
    return __('appointments.unassigned')
  }

  const selectPatient = patient =>
    dispatch({
      type: 'PATIENT_CHANGE_VALUE',
      patient
    })

  return {
    ...props,
    appointments,
    getPatient,
    fullName,
    selectPatient,
    canView
  }
}

const Appointment = (a) => {
  const { start, assigneeId, fullName, getPatient, patientId, removedAt, removedBy, note, selectPatient, type } = a
  return <tr className='enable-select'
             style={type === 'bookable' ? {} : {cursor: 'pointer'}}
             onClick={() => selectPatient(getPatient(patientId))}
             title={JSON.stringify(a)}>
  <td>{moment(start).format('HH:mm')}</td>
  <td>{fullName(assigneeId)}</td>
  <td>{
    patientId
      ? <PatientName patient={getPatient(patientId)} />
      : (type !== 'bookable') && note
  }{
    type === 'bookable' &&
      <span style={{color: '#6AA7FA', fontSize: '80%'}}>
        <Icon name='share-square-o' />&nbsp;
        {a.note}
      </span>
  }</td>
  <td>{fullName(removedBy)}</td>
  <td>{moment(removedAt).format(__('time.dateFormat'))}</td>
  <td>{moment(removedAt).format(__('time.timeFormat'))}</td>
</tr>

}

const RemovedList = ({ appointments, canView, showAll, setShowAll, ...rest }) =>
  !canView ? null : <Box 
    noPadding
    title={<span style={{zoom: 0.7}}>Gelöschte Termine
            &emsp;
            <FormControlLabel
              label="(inkl. Online-Freigaben)"
              control={
                <Checkbox
                  size="small"
                  checked={showAll}
                  onChange={e => setShowAll(!showAll)}
                >(inkl. Online-Freigaben)</Checkbox>
              }
            />
          </span>}
    >
    {
      appointments.length === 0
        ? 'Keine gelöschten Termine an diesem Tag'
        : <table className='table' style={tableStyle}>
          <thead>
            <tr>
              <td>Termin</td>
              <td>Bei</td>
              <td>PatientIn</td>
              <td>Gelöscht von</td>
              <td>am</td>
              <td>um</td>
            </tr>
          </thead>
          <tbody>
            {
              sortBy(appointments, 'start')
              .map(a =>
                <Appointment key={a._id} {...a} {...rest} />
              )
            }
          </tbody>
        </table>
    }
  </Box>

export const RemovedAppointments = compose(
  connect(),
  withState('showAll', 'setShowAll', false),
  withTracker(composer)
)(RemovedList)

const appointmentStyle = {
  cursor: 'pointer'
}

const tableStyle = {
  width: '100%'
}
