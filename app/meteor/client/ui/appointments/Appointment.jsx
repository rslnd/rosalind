import React from 'react'
import moment from 'moment'
import style from './style'

export class Appointment extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  render () {
    const appointment = this.props.appointment
    return (
      <div
        data-id={appointment._id}
        className={style.appointment}
        onClick={() => this.props.handleAppointmentModalOpen(appointment)}
        style={{
          gridRowStart: moment(appointment.start).format('[time-]HHmm'),
          gridRowEnd: moment(appointment.end).format('[time-]HHmm'),
          gridColumn: `assignee-${appointment.assigneeId}`
        }}>
        {
          appointment.patient
          ? (
            <span>
              <span className={style.prefix}>{appointment.patient.prefix}&#8202;</span>
              <b>{appointment.patient.profile.lastName}</b>&thinsp;
              {appointment.patient.profile.firstName}
            </span>
          ) : (
            <span>
              {this.stripNumbers(appointment.notes)}
            </span>
          )
        }
      </div>
    )
  }
}
