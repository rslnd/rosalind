import React from 'react'
import isEqual from 'lodash/isEqual'
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
import namecase from 'namecase'
import { getDefaultDuration } from '../../../../api/appointments/methods/getDefaultDuration'

const styles = {
  appointment: {
    borderLeft: `16px solid ${primaryActive}`,
    borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
    cursor: 'pointer',
    marginLeft: 0,
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
    display: 'inline-block',
    maxHeight: '100%',
    minWidth: '100%',
    wordBreak: 'break-all',
    hyphens: 'auto',
    overflow: 'hidden'
  }
}

class AppointmentItem extends React.Component {
  stripNumbers (text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  shouldComponentUpdate (nextProps) {
    const a = this.props.appointment
    const b = nextProps.appointment

    if (a.admitted !== b.admitted) { return true }
    if (a.canceled !== b.canceled) { return true }
    if (a.treated !== b.treated) { return true }
    if (a.start.getTime() !== b.start.getTime()) { return true }
    if (!isEqual(a.tags, b.tags)) { return true }

    if (this.props.isMoving || nextProps.isMoving) { return true }

    const p = (this.props.patient || a.patient)
    const q = (nextProps.patient || b.patient)

    if (p && q) {
      if (p.gender !== q.gender) { return true }
      if (p.firstName !== q.firstName) { return true }
      if (p.lastName !== q.lastName) { return true }
    } else if (p || q) {
      return true
    }

    return false
  }

  render () {
    this.props.isMoving && console.log(this.props)

    const { appointment, classes, format } = this.props
    const start = moment(appointment.start)
    const appointmentClasses = classnames({
      [ classes.appointment ]: true,
      [ classes.canceled ]: appointment.canceled,
      [ classes.admitted ]: appointment.admitted,
      [ classes.treated ]: appointment.treated,
      [ classes.locked ]: appointment.lockedBy,
      [ classes.moving ]: this.props.isMoving
    })
    const tagColor = getColor(appointment.tags)

    let timeStart, timeEnd, assigneeId

    if (this.props.isMoving) {
      const newStartTime = moment(this.props.moveToTime)
      const newAssigneeId = this.props.moveToAssigneeId
      const duration = getDefaultDuration({
        calendarId: appointment.calendarId,
        assigneeId: newAssigneeId,
        date: newStartTime,
        tags: appointment.tags
      })
      timeStart = newStartTime.format('[T]HHmm')
      timeEnd = newStartTime.add(duration, 'minutes').format('[T]HHmm')
      assigneeId = newAssigneeId
    } else {
      timeStart = appointment.timeStart || start.format('[T]HHmm')
      timeEnd = appointment.timeEnd || moment(appointment.end).format('[T]HHmm')
      assigneeId = appointment.assigneeId
    }

    const patient = appointment.patient || this.props.patient

    return (
      <div
        id={appointment._id}
        data-appointmentid={appointment._id}
        className={appointmentClasses}
        onClick={(e) => this.props.onClick(e, appointment)}
        onContextMenu={(e) => this.props.onClick(e, appointment)}
        title={format(timeStart)}
        style={{
          gridRowStart: timeStart,
          gridRowEnd: timeEnd,
          gridColumn: `assignee-${assigneeId}`,
          borderLeftColor: tagColor,
          zIndex: appointment.lockedBy ? 29 : 30
        }}>

        {
          appointment.lockedBy &&
            <span style={styles.patientName} className='text-muted'>
              <i className='fa fa-clock-o fa-fw' />&nbsp;
              {TAPi18n.__('appointments.lockedBy', { name: appointment.lockedByFirstName })}
            </span>
        }

        <span
          style={styles.patientName}
          className={appointment.canceled ? classes.canceled : undefined}>
          <Indicator appointment={appointment} />
          {
            patient
            ? (
              <span>
                <span className={classes.prefix}>{patient.prefix}&nbsp;</span>
                {patient.lastName && <b>{namecase(patient.lastName)}&nbsp;&nbsp;</b>}
                {patient.firstName && <span>{namecase(patient.firstName)}</span>}
              </span>
            ) : !appointment.lockedBy && (
              this.stripNumbers(appointment.notes) || <Icon name='question-circle' />
            )
          }
        </span>
      </div>
    )
  }
}

export const Appointment = injectSheet(styles)(AppointmentItem)
