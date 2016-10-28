import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { getColor } from 'client/ui/tags/getColor'
import style from './style'

export class Appointment extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  render () {
    const appointment = this.props.appointment

    const classes = classnames({
      [ style.appointment ]: true,
      [ style.canceled ]: appointment.canceled,
      [ style.admitted ]: appointment.admitted,
      [ style.treated ]: appointment.treated,
      [ style.locked ]: appointment.lockedAt
    })

    const tagColor = getColor(appointment.tags)

    return (
      <div
        id={appointment._id}
        data-appointmentId={appointment._id}
        className={classes}
        onClick={() => this.props.handleAppointmentModalOpen(appointment)}
        style={{
          gridRowStart: moment(appointment.start).format('[time-]HHmm'),
          gridRowEnd: moment(appointment.end).format('[time-]HHmm'),
          gridColumn: `assignee-${appointment.assigneeId}`,
          borderColor: tagColor,
          zIndex: 30
        }}>

        {
          appointment.treated
          ? (
            <span
              style={{ color: tagColor }}>
              <Icon name="check" />&nbsp;
            </span>
          ) : (
            appointment.admitted &&
              <span
                style={{ color: tagColor }}>
                <Icon name="refresh" />&nbsp;
              </span>
          )
        }

        {
          appointment.lockedAt &&
            <span className="text-muted">
              <i className="fa fa-clock-o fa-fw"></i>
              {TAPi18n.__('appointments.lockedBy', { name: appointment.lockedByFirstName })}
            </span>
        }

        {
          appointment.patient
          ? (
            <span>
              <span className={style.prefix}>{appointment.patient.prefix}&#8202;</span>
              <b>{appointment.patient.profile.lastName}</b>&thinsp;
              {appointment.patient.profile.firstName}
            </span>
          ) : !appointment.lockedAt && (
            <span>
              {this.stripNumbers(appointment.notes) || <Icon name="question-circle" />}
            </span>
          )
        }
      </div>
    )
  }
}
