import React from 'react'
import moment from 'moment-timezone'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from '../../../components/Icon'
import { getColor } from '../../../tags/getColor'
import { Indicator } from '../../appointment/Indicator'
import { format } from '../grid/timeSlots'
import { background, primaryActive, darkGrayDisabled, darkGray } from '../../../css/global'
import { color, lightness } from 'kewler'

const styles = {
  appointment: {
    borderLeft: `16px solid ${primaryActive}`,
    borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
    cursor: 'pointer',
    marginLeft: 0,
    overflow: 'hidden',
    paddingLeft: 4,
    whiteSpace: 'pre-wrap',
    backgroundColor: background,
    '&:hover': {
      backgroundColor: color(background, lightness(3))
    }
  },
  show: {
    borderWidth: 0
  },
  canceled: {
    color: darkGrayDisabled,
    textDecoration: 'line-through'
  },
  prefix: {
    color: darkGray
  },
  moving: {
    opacity: 0.5
  },
  patientName: {
    hyphens: 'auto'
  }
}

class AppointmentItem extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  render () {
    const { appointment, classes } = this.props
    const start = moment(appointment.start)
    const appointmentClasses = classnames({
      [ classes.appointment ]: true,
      [ classes.canceled ]: appointment.canceled,
      [ classes.admitted ]: appointment.admitted,
      [ classes.treated ]: appointment.treated,
      [ classes.locked ]: appointment.lockedAt,
      [ classes.moving ]: this.props.isMoving
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
        className={appointmentClasses}
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
            <span className='text-muted'>
              <i className='fa fa-clock-o fa-fw' />&nbsp;
              {TAPi18n.__('appointments.lockedBy', { name: appointment.lockedByFirstName })}
            </span>
        }

        <Indicator appointment={appointment} />

        {
          patient
          ? (
            <span style={styles.patientName}>
              <span className={classes.prefix}>{patient.prefix}&#8202;</span>
              <b>{patient.profile.lastName} &thinsp;</b>
              <span>{patient.profile.firstName}</span>
            </span>
          ) : !appointment.lockedAt && (
            <span>
              {this.stripNumbers(appointment.notes) || <Icon name='question-circle' />}
            </span>
          )
        }
      </div>
    )
  }
}

export const Appointment = injectSheet(styles)(AppointmentItem)
