import React from 'react'
import { withTracker } from '../../components/withTracker'
import { compose } from 'recompose'
import { subscribe } from '../../../util/meteor/subscribe'
import { dateToDay } from '../../../util/time/day'
import { Appointments, Patients, Users } from '../../../api'
import moment from 'moment'
import { PatientName } from '../../patients/PatientName'
import { fullNameWithTitle } from '../../../api/users/methods'
import { __ } from '../../../i18n'
import { connect } from 'react-redux'
import { hasRole } from '../../../util/meteor/hasRole'
import { Meteor } from 'meteor/meteor'
import { Box } from '../../components/Box'

const composer = props => {
  const { dispatch, calendarId, date } = props
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
    removed: true
  }, {
    removed: true,
    sort: {
      removedAt: 1
    }
  }).fetch()

  const getPatient = _id => Patients.findOne({ _id })
  const fullName = _id => _id
    ? fullNameWithTitle(Users.findOne({ _id }, { removed: true }))
    : __('appointments.unassigned')

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

const Appointment = ({ start, assigneeId, fullName, getPatient, patientId, removedAt, removedBy, note, selectPatient }) =>
  <tr style={appointmentStyle} onClick={() => selectPatient(getPatient(patientId))}>
    <td>{moment(start).format('HH:mm')}</td>
    <td>{fullName(assigneeId)}</td>
    <td>{
      patientId
        ? <PatientName patient={getPatient(patientId)} />
        : note
    }</td>
    <td>{fullName(removedBy)}</td>
    <td>{moment(removedAt).format(__('time.dateFormat'))}</td>
    <td>{moment(removedAt).format(__('time.timeFormat'))}</td>
  </tr>

const RemovedList = ({ appointments, canView, ...rest }) =>
  !canView ? null : <Box title='Gelöschte Termine' noPadding>
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
            {appointments.map(a =>
              <Appointment key={a._id} {...a} {...rest} />
            )}
          </tbody>
        </table>
    }
  </Box>

export const RemovedAppointments = compose(
  connect(),
  withTracker(composer)
)(RemovedList)

const appointmentStyle = {
  cursor: 'pointer'
}

const tableStyle = {
  width: '100%'
}
