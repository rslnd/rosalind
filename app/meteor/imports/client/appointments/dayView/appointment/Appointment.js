import React from 'react'
import isEqual from 'lodash/isEqual'
import moment from 'moment-timezone'
import classnames from 'classnames'
import injectSheet from 'react-jss'
import { __ } from '../../../../i18n'
import { Icon } from '../../../components/Icon'
import { getColor } from '../../../tags/getColor'
import { Indicator } from '../../appointment/Indicator'
import { background, primaryActive, darkGrayDisabled, darkGray, lighten } from '../../../layout/styles'
import { namecase } from '../../../../util/namecase'
import { getDefaultDuration } from '../../../../api/appointments/methods/getDefaultDuration'
import { prefix } from '../../../../api/patients/methods'
import { Appointments, Users } from '../../../../api'
import Alert from 'react-s-alert'

const assigneeName = _id => {
  const user = Users.findOne({ _id })
  if (user) {
    return Users.methods.fullName(user)
  }
}

const styles = {
  appointment: {
    borderLeft: `10px solid ${primaryActive}`,
    // borderBottom: '1px solid rgba(128, 128, 128, 0.2)',
    cursor: 'pointer',
    marginLeft: 0,
    paddingLeft: 4,
    whiteSpace: 'pre-wrap',
    backgroundColor: 'rgba(236, 240, 245, 0.75)',
    '&:hover': {
      backgroundColor: lighten(background)
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
  colliding: {
    opacity: 0.5,
    backgroundColor: 'red'
  },
  patientName: {
    maxHeight: '100%',
    flexShrink:  1,
    minWidth: 0,
    wordBreak: 'break-all',
    hyphens: 'auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: '.'
  }
}

const appointmentStyle = {
  display: 'flex',
  minWidth: 0,
  justifyContent: 'space-between'
}

const middleStyle = {
  flexGrow: 1,
  textAlign: 'center',
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: '.',
  marginTop: 3,
  marginRight: 2,
  marginLeft: 2
}

const rightStyle = {
  flexShrink: 1,
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: '.'
}

const bookableIconStyle = {
  display: 'inline-block',
  color: '#6AA7FA',
  opacity: 0.9,
  zoom: 0.8,
  paddingTop: 3,
  paddingBottom: 3,
  paddingLeft: 8,
  paddingRight: 8,
}

const bookableStyle = {
  ...bookableIconStyle,
  paddingTop: 3,
  paddingBottom: 3,
  paddingLeft: 8,
  paddingRight: 8,
  backgroundColor: '#fff',
  pointerEvents: 'auto'
}

const handleUnsetBookable = ({ _id }) => event => {
  event.preventDefault()
  event.stopPropagation()
  Appointments.actions.unsetBookable.callPromise({
    bookableId: _id
  }).then(a => {
    Alert.success(__('appointments.unsetBookableSuccess'))
  }).catch(e => {
    console.error(e)
    Alert.error(e.message)
  })
}

const Bookable = ({ canEdit, ...props }) =>
  <div
    style={bookableStyle}
    title={__('appointments.unsetBookable')}
    onClick={canEdit && handleUnsetBookable(props)}
    {...props}
  >
      <Icon name='share-square-o' />
  </div>


class AppointmentItem extends React.Component {
  stripNumbers(text) {
    if (typeof text === 'string') {
      return text.replace(/\d{3,}/g, '')
    }
  }

  shouldComponentUpdate(nextProps) {
    const a = this.props.appointment
    const b = nextProps.appointment

    if (!b) { return true }

    if (a.isColliding !== b.isColliding) { return true }
    if (a.admitted !== b.admitted) { return true }
    if (a.canceled !== b.canceled) { return true }
    if (a.treated !== b.treated) { return true }
    if (a.start !== b.start) { return true }
    if (a.treatmentStart !== b.treatmentStart) { return true }
    if (a.treatmentEnd !== b.treatmentEnd) { return true }
    if (a.treated !== b.treated) { return true }
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

  render() {
    const { appointment, calendar, classes, format } = this.props
    const appointmentClasses = classnames({
      [classes.appointment]: true,
      [classes.canceled]: appointment.canceled,
      [classes.admitted]: appointment.admitted,
      [classes.treated]: appointment.treated,
      [classes.locked]: appointment.lockedBy,
      [classes.moving]: this.props.isMoving,
      [classes.colliding]: appointment.isColliding
    })
    const tagColor = getColor(appointment.tags)

    let timeStart, timeEnd, assigneeId

    if (this.props.isMoving) {
      const newStartTime = moment(this.props.moveToStart || appointment.start)
      const newAssigneeId = this.props.moveToAssigneeId
      const duration = getDefaultDuration({
        calendarId: appointment.calendarId,
        assigneeId: newAssigneeId,
        date: newStartTime,
        tags: appointment.tags
      })
      timeStart = newStartTime.format('[T]HHmm')
      timeEnd = duration
        ? newStartTime.add(duration, 'minutes').format('[T]HHmm')
        : moment(this.props.moveToEnd || appointment.end).format('[T]HHmm')
      assigneeId = newAssigneeId
    } else {
      timeStart = moment(appointment.start).format('[T]HHmm')
      timeEnd = moment(appointment.end).format('[T]HHmm')
      assigneeId = appointment.assigneeId
    }

    const patient = appointment.patient

    const prefixStyle =
      ((calendar && calendar.showGenderColor === 'prefixOnly' || calendar && calendar.showGenderColor === 'true')
      && patient && patient.gender === 'Female') ? femaleStyle : {}

    const nameStyle = (calendar && calendar.showGenderColor === 'true' && patient && patient.gender === 'Female')
      ? femaleStyle : {}

    const isBookable = (appointment.type === 'bookable')

    if (isBookable) {
      if (!this.props.canSeeBookables) {
        return null
      }

      return <div
        id={appointment._id}
        data-appointmentid={appointment._id}
        style={{
          gridRowStart: timeStart,
          gridRowEnd: timeEnd,
          gridColumn: `assignee-${assigneeId || 'unassigned'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          pointerEvents: 'none', // click through to blank
          zIndex: 31,
        }}
      >
        <Bookable _id={appointment._id} canEdit={this.props.canEditBookables} />
      </div>
    }

    return (
      <div
        id={appointment._id}
        data-appointmentid={appointment._id}
        className={appointmentClasses}
        onClick={(e) => this.props.onClick(e, appointment)}
        onContextMenu={(e) => this.props.onClick(e, appointment)}
        title={format(timeStart)}
        style={{
          ...appointmentStyle,
          gridRowStart: timeStart,
          gridRowEnd: timeEnd,
          gridColumn: `assignee-${assigneeId || 'unassigned'}`,
          borderLeftColor: tagColor,
          overflow: 'hidden',
          zIndex: appointment.lockedBy ? 29 : 30,
          pointerEvents: this.props.isMoving ? 'none' : 'auto' // click/hover through to blank while moving
        }}>

        {
          appointment.lockedBy &&
          <span style={styles.patientName} className='text-muted'>
            <i className='fa fa-clock-o fa-fw' />&nbsp;
              {__('appointments.lockedBy', { name: assigneeName(appointment.lockedBy) })}
          </span>
        }

        <span
          style={styles.patientName}
          className={appointment.canceled ? classes.canceled : undefined}>
          {
            patient
              ? (
                <span>
                  <span className={classes.prefix} style={prefixStyle}>
                    {prefix(patient)}
                    &nbsp;
                    {
                      calendar && calendar.showTitles && patient.titlePrepend &&
                        <span>{patient.titlePrepend}&nbsp;</span>
                    }
                  </span>
                  {patient.lastName && <b style={nameStyle}>{namecase(patient.lastName)}&nbsp;&nbsp;</b>}
                  {patient.firstName && <span style={nameStyle}>{namecase(patient.firstName)}</span>}

                  {
                    calendar && calendar.showNewPatientIndicator && !patient.external &&
                      <span
                        title='Neu: Kartei nur im Kalender angelegt'
                        className='text-muted'
                      >
                        &nbsp;*
                      </span>
                  }
                  {
                    calendar && calendar.showTitles && patient.titleAppend &&
                      <span style={nameStyle}>&nbsp;{patient.titleAppend}</span>
                  }
                  {
                    patient.label &&
                    <span className={classes.prefix} style={nameStyle}>&ensp;{patient.label}</span>
                  }
                </span>
              ) : (
                ((appointment.type === 'lock' || appointment.lockedBy) && <span>&nbsp;</span>) ||
                this.stripNumbers(appointment.note) ||
                (isBookable && 'Bookable') ||
                ((!appointment.tags || appointment.tags.length === 0) && (appointment.note || 'PAUSE')) ||
                <Icon name='question-circle' />
              )
          }
        </span>

        {
          calendar && calendar.showAppointmentNote && appointment.note &&
            <small style={middleStyle} className='text-muted'>&emsp;&emsp;{appointment.note}</small>
        }

        <div style={rightStyle}>
          {
            calendar && calendar.showTagNames &&
              <TagNames tags={appointment.tags} />
          }
          <Indicator
            appointment={appointment}
            calendar={calendar}
          />
          {
            appointment.createdViaPortal &&
            <span title='Online gebucht' style={bookableIconStyle}>
              <Icon name='square' />
            </span>
          }
        </div>
      </div>
    )
  }
}

const TagNames = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null
  }

  return <small className='text-muted pt1'>
    {
      tags.map((t, i) =>
        <span
          key={i}
          style={t.textColor ? { color: t.textColor } : null}
          title={t.shortTag
            ? [t.tag, ...(t.synonyms || [])].join(', ')
            : null}
        >
          {/* <Icon
            name='circle'
            style={{ color: t.color }}
          /> */}
          {t.shortTag || t.tag || '?'}&nbsp;
        </span>
      )
    }
    &nbsp;
  </small>
}

const femaleStyle = {
  color: 'rgb(148, 88, 119)'
}

export const Appointment = injectSheet(styles)(AppointmentItem)
