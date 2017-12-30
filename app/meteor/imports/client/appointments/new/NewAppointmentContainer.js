import React from 'react'
import moment from 'moment-timezone'
import { connect } from 'react-redux'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { NewAppointment } from './NewAppointment'
import { Appointments } from '../../../api/appointments'
import { Schedules } from '../../../api/schedules'
import { Tags } from '../../../api/tags'
import { getDefaultDuration, isConstraintApplicable } from '../../../api/appointments/methods/getDefaultDuration'

export class NewAppointmentContainerComponent extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSubmitPause = this.handleSubmitPause.bind(this)
    this.allowedTags = this.allowedTags.bind(this)
  }

  handleSubmitPause () {
    const appointment = {
      note: 'PAUSE',
      calendarId: this.props.calendar._id,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(this.props.calendar.slotSize || 5, 'minutes').toDate(),
      assigneeId: this.props.assigneeId
    }

    console.log('[Appointments] Inserting pause', { appointment })

    return Appointments.actions.insert.callPromise({ appointment })
      .then(() => {
        this.props.dispatch({ type: 'APPOINTMENT_INSERT_SUCCESS' })
        Alert.success(TAPi18n.__('appointments.pauseInsertSuccess'))
        if (this.props.onClose) { this.props.onClose() }
      })
      .catch((e) => {
        console.error(e)
        Alert.error(TAPi18n.__('appointments.insertError'))
      })
  }

  handleSubmit (values, dispatch) {
    console.log('[Appointments] Submitting new Appointment', { values })
    let newPatient = null

    if ((values.patientId === 'newPatient') && values.lastName) {
      newPatient = {
        profile: {
          lastName: values.lastName,
          firstName: values.firstName,
          gender: values.gender,
          note: values.patientNote,
          birthday: values.birthday
        }
      }

      newPatient.profile.contacts = []

      if (values.telephone) {
        newPatient.profile.contacts.push({
          channel: 'Phone', value: values.telephone
        })
      }

      if (values.email) {
        newPatient.profile.contacts.push({
          channel: 'Email', value: values.email
        })
      }
    }

    const length = getDefaultDuration({
      calendarId: this.props.calendar._id,
      assigneeId: this.props.assigneeId,
      tags: values.tags,
      date: moment(this.props.time)
    })

    const appointment = {
      calendarId: this.props.calendar._id,
      patientId: newPatient ? undefined : values.patientId,
      note: values.appointmentNote,
      tags: values.tags,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(length, 'minutes').toDate(),
      assigneeId: this.props.assigneeId,
      privateAppointment: Tags.methods.isPrivate(values.tags)
    }

    console.log('[Appointments] Inserting appointment with new patient', { newPatient, appointment })

    return Appointments.actions.insert.callPromise({ appointment, newPatient })
      .then(() => {
        dispatch({ type: 'APPOINTMENT_INSERT_SUCCESS' })
        Alert.success(TAPi18n.__('appointments.insertSuccess'))
        if (this.props.onClose) { this.props.onClose() }
      })
      .catch((e) => {
        console.error(e)
        Alert.error(TAPi18n.__('appointments.insertError'))
      })
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
      <NewAppointment
        onSubmit={this.handleSubmit}
        onSubmitPause={this.handleSubmitPause}
        initialValues={this.props.patientId ? { patientId: this.props.patientId } : {}}
        time={this.props.time}
        calendarId={this.props.calendar._id}
        assigneeId={this.props.assigneeId}
        allowedTags={this.allowedTags()} />
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
