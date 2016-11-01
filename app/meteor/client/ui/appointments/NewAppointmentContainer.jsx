import React from 'react'
import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { NewAppointment } from './NewAppointment'
import { Appointments } from 'api/appointments'
import Alert from 'react-s-alert'

export class NewAppointmentContainer extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (formData, dispatch) {
    console.log({ formData })
    let newPatient = null

    if (formData.patientId === 'newPatient') {
      // FIXME: CRITICAL: Parse birthday and telephone (contacts)
      newPatient = {
        profile: {
          lastName: formData.lastName,
          firstName: formData.firstName,
          gender: formData.gender,
          note: formData.patientNote,
          birthday: formData.birthday,
          contacts: [
            { channel: 'Phone', value: formData.telephone }
          ]
        }
      }
    }

    const appointment = {
      patientId: newPatient ? undefined : formData.patientId,
      note: formData.appointmentNote,
      tags: formData.tags,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(5, 'minutes').toDate(),
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

  render () {
    return (
      <NewAppointment
        onSubmit={this.handleSubmit}
        assigneeId={this.props.assigneeId}
        time={this.props.time} />
    )
  }
}
