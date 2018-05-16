import React from 'react'
import moment from 'moment-timezone'
import { connect } from 'react-redux'
import Alert from 'react-s-alert'
import { __ } from '../../../i18n'
import { NewAppointmentForm } from './NewAppointmentForm'
import { Appointments } from '../../../api/appointments'
import { Schedules } from '../../../api/schedules'
import { Tags } from '../../../api/tags'
import { getDefaultDuration, isConstraintApplicable } from '../../../api/appointments/methods/getDefaultDuration'
import { mapFieldsToPatient } from '../../patients/mapFieldsToPatient'
import { calculateRevenue } from './RevenueField'

export class NewAppointmentContainerComponent extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSubmitPause = this.handleSubmitPause.bind(this)
    this.allowedTags = this.allowedTags.bind(this)
    this.maxDuration = this.maxDuration.bind(this)
  }

  handleSubmitPause () {
    const appointment = {
      note: 'PAUSE',
      calendarId: this.props.calendar._id,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(this.props.calendar.defaultDuration || this.props.calendar.slotSize || 5, 'minutes').toDate(),
      assigneeId: this.props.assigneeId
    }

    console.log('[Appointments] Inserting pause', { appointment })

    return Appointments.actions.insert.callPromise({ appointment })
      .then(() => {
        this.props.dispatch({ type: 'APPOINTMENT_INSERT_SUCCESS' })
        Alert.success(__('appointments.pauseInsertSuccess'))
        if (this.props.onClose) { this.props.onClose() }
      })
      .catch((e) => {
        console.error(e)
        Alert.error(__('appointments.insertError'))
      })
  }

  handleSubmit (values, dispatch) {
    console.log('[Appointments] Submitting new Appointment')

    let newPatient = null
    let patientId = values.patient.patientId

    if (!patientId && !values.appointment.appointmentNote) {
      Alert.error(__('appointments.patientOrNoteError'))
      throw new Error('Cannot save appointment without patientId or appointmentNote')
    }

    if (patientId) {
      if (patientId === 'newPatient') {
        patientId = undefined
      }

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
      note: values.appointment.appointmentNote,
      tags: values.appointment.tags,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(duration, 'minutes').toDate(),
      assigneeId: this.props.assigneeId,
      privateAppointment: Tags.methods.isPrivate(values.appointment.tags),
      revenue
    }

    console.log('[Appointments] Inserting appointment with new patient', { appointment })

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

  maxDuration () {
    const nextAppointments = Appointments.find({
      start: { $gt: this.props.time },
      assigneeId: this.props.assigneeId,
      calendarId: this.props.calendar._id
    }, { sort: { start: 1 }, limit: 1 }).fetch()

    if (nextAppointments[0]) {
      return Math.abs(
        moment.range(
          this.props.time,
          nextAppointments[0].start
        ).diff('minutes')
      )
    } else {
      return null
    }
  }

  allowedTags () {
    const date = moment(this.props.time)

    const constraint = Schedules.findOne({
      type: 'constraint',
      userId: this.props.assigneeId,
      weekdays: date.clone().locale('en').format('ddd').toLowerCase(),
      start: { $lte: date.toDate() },
      end: { $gte: date.toDate() }
    })

    return constraint && isConstraintApplicable({ constraint, date }) && constraint.tags
  }

  render () {
    return (
      <NewAppointmentForm
        onSubmit={this.handleSubmit}
        onSubmitPause={this.handleSubmitPause}
        initialValues={
          this.props.patientId
          ? { patient: { patientId: this.props.patientId } }
          : {}
        }
        time={this.props.time}
        calendarId={this.props.calendar._id}
        assigneeId={this.props.assigneeId}
        allowedTags={this.allowedTags()}
        maxDuration={this.maxDuration()}
        extended={this.props.calendar.privateAppointments} />
    )
  }
}

const mapStateToProps = (store) => {
  const state = store.appointments.search
  const patientId = state.patientId ||
    (state.query && state.query.patient && state.query.patient._id)
  return { patientId }
}

export const NewAppointmentContainer = connect(mapStateToProps)(NewAppointmentContainerComponent)
