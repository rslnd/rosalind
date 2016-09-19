import React from 'react'
import moment from 'moment'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import sortBy from 'lodash/fp/sortBy'
import { Tags } from 'api/tags'
import style from './style'

export class Appointment extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  getColor (tags = []) {
    if (tags.length === 0) {
      return '#ccc'
    } else {
      return flow(
        map((tag) => {
          return Tags.findOne({ tag: tag })
        }),
        sortBy('order'),
        map((tag) => {
          return tag.color || '#ccc'
        })
      )(tags)[0]
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
          gridColumn: `assignee-${appointment.assigneeId}`,
          borderColor: this.getColor(appointment.tags)
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
