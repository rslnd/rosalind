import React from 'react'
import moment from 'moment'
import classnames from 'classnames'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { getColor } from 'client/ui/tags/getColor'
import { Indicator } from 'client/ui/appointments/appointment/Indicator'
import style from './appointmentStyle'
import { format } from '../grid/timeSlots'

export class Appointment extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  render () {
    const appointment = this.props.appointment
    const start = moment(appointment.start)
    const classes = classnames({
      [ style.appointment ]: true,
      [ style.canceled ]: appointment.canceled,
      [ style.admitted ]: appointment.admitted,
      [ style.treated ]: appointment.treated,
      [ style.locked ]: appointment.lockedAt,
      [ style.moving ]: this.props.isMoving
    })
    const tagColor = getColor(appointment.tags)

    let timeStart, timeEnd, assigneeId

    if (this.props.isMoving) {
      const duration = (appointment.end - appointment.start)
      const newStartTime = moment(this.props.moveToTime)
      timeStart = newStartTime.format('[T]HHmm')
      timeEnd = newStartTime.add(duration, 'milliseconds').format('[T]HHmm')
      assigneeId = this.props.moveToAssigneeId
    } else {
      timeStart = appointment.timeStart || start.format('[T]HHmm')
      timeEnd = appointment.timeEnd || moment(appointment.end).format('[T]HHmm')
      assigneeId = appointment.assigneeId
    }

    const patient = appointment.patient || this.props.patient

    return (
      <div
        id={appointment._id}
        data-appointmentId={appointment._id}
        className={classes}
        onClick={(e) => this.props.onClick(e, appointment)}
        onContextMenu={(e) => this.props.onClick(e, appointment)}
        title={format(timeStart)}
        style={{
          gridRowStart: timeStart,
          gridRowEnd: timeEnd,
          gridColumn: `assignee-${assigneeId}`,
          borderLeftColor: tagColor,
          zIndex: appointment.lockedAt ? 29 : 30
        }}>

        {
          appointment.lockedAt &&
            <span className="text-muted">
              <i className="fa fa-clock-o fa-fw"></i>&nbsp;
              {TAPi18n.__('appointments.lockedBy', { name: appointment.lockedByFirstName })}
            </span>
        }

        <Indicator appointment={appointment} />

        {
          patient
          ? (
            <span style={{ hyphens: 'auto' }}>
              <span className={style.prefix}>{patient.prefix}&#8202;</span>
              <b>{patient.profile.lastName} &thinsp;</b>
              <span>{patient.profile.firstName}</span>
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
