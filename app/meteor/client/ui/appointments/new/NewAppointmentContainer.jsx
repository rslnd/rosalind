import React from 'react'
import moment from 'moment-timezone'
import { connect } from 'react-redux'
import { TAPi18n } from 'meteor/tap:i18n'
import { NewAppointment } from './NewAppointment'
import { Appointments } from 'api/appointments'
import { Schedules } from 'api/schedules'
import Alert from 'react-s-alert'
import { getDefaultLength } from 'api/appointments/methods/getDefaultLength'

export class NewAppointmentContainerComponent extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.allowedTags = this.allowedTags.bind(this)
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

      if (values.telephone) {
        newPatient.profile.contacts = [
          { channel: 'Phone', value: values.telephone }
        ]
      }
    }

    const length = getDefaultLength({
      assigneeId: this.props.assigneeId,
      tags: values.tags,
      date: moment(this.props.time)
    })

    const appointment = {
      patientId: newPatient ? undefined : values.patientId,
      note: values.appointmentNote,
      tags: values.tags,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(length, 'minutes').toDate(),
      assigneeId: this.props.assigneeId
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
    const constraint = Schedules.findOne({
      type: 'constraint',
      userId: this.props.assigneeId,
      weekdays: moment(this.props.time).clone().locale('en').format('ddd').toLowerCase(),
      start: { $lte: moment(this.props.time).toDate() },
      end: { $gte: moment(this.props.time).toDate() }
    })

    return constraint && constraint.tags
  }

  render () {
    return (
      <NewAppointment
        onSubmit={this.handleSubmit}
        initialValues={this.props.patientId ? { patientId: this.props.patientId } : {}}
        time={this.props.time}
        allowedTags={this.allowedTags()} />
    )
  }
}

const mapStateToProps = (store) => {
  const state = store.appointmentsSearch
  const patientId = state.patientId ||
    (state.query && state.query.patient && state.query.patient._id)
  return { patientId }
}

export const NewAppointmentContainer = connect(mapStateToProps)(NewAppointmentContainerComponent)
