import React from 'react'
import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { NewAppointment } from './NewAppointment'
import { Appointments } from 'api/appointments'
import { sAlert } from 'meteor/juliancwirko:s-alert'

export class NewAppointmentContainer extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (data, dispatch) {
    const appointment = {
      ...data,
      start: moment(this.props.time).toDate(),
      end: moment(this.props.time).add(5, 'minutes').toDate(),
      assigneeId: this.props.assigneeId
    }

    return Appointments.actions.insert.callPromise({ appointment })
      .then(() => {
        dispatch({ type: 'APPOINTMENT_INSERT_SUCCESS' })
        sAlert.success(TAPi18n.__('appointments.insertSuccess'))
      })
      .catch((e) => {
        console.error(e)
        sAlert.error(TAPi18n.__('appointments.insertError'))
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
