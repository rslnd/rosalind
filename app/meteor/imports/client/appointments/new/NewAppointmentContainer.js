import React from 'react'
import moment from 'moment-timezone'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Constraints } from '../../../api/constraints/'
import { findConstraint } from '../../../api/constraints/methods/findConstraint'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { NewAppointmentForm } from './NewAppointmentForm'
import { Appointments } from '../../../api/appointments'
import { Tags } from '../../../api/tags'
import { getDefaultDuration } from '../../../api/appointments/methods/getDefaultDuration'
import { mapFieldsToPatient } from '../../patients/mapFieldsToPatient'
import { calculateRevenue } from './RevenueField'
import { withTracker } from '../../components/withTracker'

export class NewAppointmentContainerComponent extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSubmitPause = this.handleSubmitPause.bind(this)
  }

  handleSubmitPause ({ note, duration } = {}) {
    console.log(note, duration)
    const appointment = {
      note: note || 'PAUSE',
      calendarId: this.props.calendar._id,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(duration || this.props.calendar.defaultDuration || this.props.calendar.slotSize || 5, 'minutes').toDate(),
      assigneeId: this.props.assigneeId
    }

    console.log('[Appointments] Inserting pause/special', { appointment })

    return Appointments.actions.insert.callPromise({ appointment })
      .then(() => {
        this.props.dispatch({ type: 'APPOINTMENT_INSERT_SUCCESS' })
        Alert.success(__('appointments.insertSuccess'))
        if (this.props.onClose) { this.props.onClose() }
      })
      .catch((e) => {
        console.error(e)
        Alert.error(__('appointments.insertError'))
      })
  }

  handleSubmit (values, dispatch) {
    if (!values.appointment) {
      console.log('[Appointments] Skipped submit')
      return
    }

    let newPatient = null
    let patientId = values.patient && (values.patient.patientId || values.patient.insuranceId)
    const hasNote = values.appointment && values.appointment.note
    if (!hasNote && !patientId) {
      Alert.error(__('appointments.patientOrNoteError'))
      console.error('[NewAppointmentContainer] This should not happen, check newAppointmentValidators')
      throw new Error('Cannot save appointment without patientId or note')
    }

    if (patientId) {
      if (patientId === 'newPatient') {
        patientId = undefined
      }

      // this also removes any patientId of 'newPatient'
      newPatient = mapFieldsToPatient(values.patient)
    }

    const duration = getDefaultDuration({
      calendarId: this.props.calendar._id,
      assigneeId: this.props.assigneeId,
      tags: values.appointment.tags,
      date: moment(this.props.time)
    })

    const revenue = (values.appointment.revenue === 0 || values.appointment.revenue > 0)
      ? values.appointment.revenue
      : calculateRevenue(values.appointment.tags)

    const appointment = {
      calendarId: this.props.calendar._id,
      patientId,
      note: values.appointment.note,
      tags: values.appointment.tags,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(duration, 'minutes').toDate(),
      assigneeId: this.props.assigneeId,
      privateAppointment: Tags.methods.isPrivate(values.appointment.tags),
      revenue
    }

    console.log('[Appointments] Inserting appointment with new patient', { appointment, newPatient })

    return Appointments.actions.insert.callPromise({ appointment, newPatient })
      .then(() => {
        dispatch({ type: 'APPOINTMENT_INSERT_SUCCESS' })
        Alert.success(__('appointments.insertSuccess'))
        if (this.props.onClose) { this.props.onClose() }
      })
      .catch((e) => {
        console.error(e)
        Alert.error(__('appointments.insertError'))
      })
  }

  render () {
    const {
      time,
      calendar,
      assigneeId,
      constraint
    } = this.props

    return (
      <NewAppointmentForm
        onSubmit={this.handleSubmit}
        onSubmitPause={this.handleSubmitPause}
        time={time}
        calendarId={calendar._id}
        assigneeId={assigneeId}
        allowedTags={Appointments.methods.getAllowedTags({ time: time, calendarId: calendar._id, assigneeId: assigneeId })}
        maxDuration={Appointments.methods.getMaxDuration({ time: time, calendarId: calendar._id, assigneeId: assigneeId })}
        constraint={constraint}
        extended={calendar.privateAppointments}
      />
    )
  }
}

const withConstraint = props => {
  const constraint = findConstraint(Constraints)({
    assigneeId: props.assigneeId,
    calendarId: props.calendar._id,
    time: props.time
  })

  return {
    ...props,
    constraint
  }
}

export const NewAppointmentContainer = compose(
  withTracker(withConstraint),
  connect()
)(NewAppointmentContainerComponent)
