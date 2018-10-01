import identity from 'lodash/identity'
import React from 'react'
import moment from 'moment-timezone'
import { withState } from 'recompose'
import { __ } from '../../i18n'
import { Users } from '../../api/users'
import { Indicator, Revenue } from '../appointments/appointment/Indicator'
import { TagsList } from '../tags/TagsList'
import { CommentsContainer } from '../comments/CommentsContainer'
import { CommentItem } from '../comments/CommentItem'

const containerStyle = {
  borderTop: '1px solid #eee',
  paddingTop: 16,
  marginTop: 6,
  marginBottom: 15
}

const appointmentRowContainerStyle = {
  paddingTop: 6
}

const tinyPaddingStyle = {
  paddingRight: 16,
  paddingBottom: 6
}

const appointmentRowStyle = {
  ...tinyPaddingStyle,
  paddingLeft: 48,
  cursor: 'pointer'
}

const separatorRowStyle = {
  paddingLeft: 48,
  marginTop: 6
}

const dateFormat = m =>
  m.year() === moment().year()
  ? m.format(__('time.dateFormatWeekdayShortNoYear'))
  : m.format(__('time.dateFormatWeekdayShort'))

const AppointmentRow = ({ appointment, expandComments, onClick, autoFocus }) => {
  const assignee = Users.findOne({ _id: appointment.assigneeId }, { removed: true })
  const canceled = appointment.canceled || appointment.removed
  const date = moment(appointment.start)

  const canceledStyle = canceled ? {
    textDecoration: 'line-through',
    color: '#ccc'
  } : {}

  const canceledTagsStyle = canceled ? {
    filter: 'grayscale(1)',
    opacity: 0.5
  } : {}

  return (
    <div style={appointmentRowContainerStyle}>
      <div style={appointmentRowStyle} onClick={onClick}>
        <div className='row'>
          <div className='col-md-3' style={canceledTagsStyle}>
            <TagsList tiny tags={appointment.tags} />
          </div>

          <div className='col-md-3 text-right' style={canceledStyle}>
            {assignee && Users.methods.fullNameWithTitle(assignee)}
          </div>

          <div className='col-md-4' style={canceledStyle}>
            {dateFormat(date)}

            <span className='pull-right' style={canceledStyle}>
              {date.format(__('time.timeFormat'))}
            </span>
          </div>

          <div className='col-md-2 text-right'>
            <div style={{ display: 'inline-block', verticalAlign: 'top', ...canceledStyle }}>
              <Revenue appointment={appointment} />
            </div>
            <div style={{ display: 'inline-block', minWidth: 25 }}>
              <Indicator appointment={appointment} />
            </div>
          </div>
        </div>
      </div>

      <div className='row'>
        <div className='col-md-12'>
          {
            appointment.note &&
              <div className='box-footer box-comments' onClick={onClick}>
                <CommentItem comment={{
                  createdBy: appointment.createdBy,
                  createdAt: appointment.createdAt,
                  body: appointment.note
                }} />
              </div>
          }
          <CommentsContainer
            docId={appointment._id}
            newComment={expandComments}
            onClick={onClick}
            autoFocus={autoFocus} />
        </div>
      </div>
    </div>
  )
}

export const PastAppointments = withState('selectedAppointmentId', 'handleAppointmentClick', null)(({
    patient,
    currentAppointment,
    pastAppointments,
    futureAppointments,
    selectedAppointmentId,
    handleAppointmentClick,
    appendIfMany }) => {
  const appointmentsWithSeparators = [
    { separator: __('appointments.thisFuture'), count: futureAppointments.length },
    ...futureAppointments,

    { separator: __('appointments.thisCurrent'), count: 1 },
    currentAppointment,

    { separator: __('appointments.thisPast'), count: pastAppointments.length },
    ...pastAppointments
  ]

  return (
    <div>
      <div style={containerStyle}>
        {
          appointmentsWithSeparators.filter(identity).map((item, i) =>
            item.separator
            ? (
              item.count > 0 &&
                <div className='row' key={i}>
                  <div className='text-muted col-md-12'>
                    <div style={separatorRowStyle}>
                      {item.separator}
                    </div>
                  </div>
                </div>
              )
            : <AppointmentRow
              key={item._id}
              appointment={item}
              expandComments={item._id === selectedAppointmentId}
              autoFocus={!!selectedAppointmentId}
              onClick={() =>
                item._id === selectedAppointmentId
                ? handleAppointmentClick(null)
                : handleAppointmentClick(item._id)
              } />
          )
        }
        <br />
        {
          patient && patient.patientSince &&
            <span className='text-muted' style={separatorRowStyle}>
              PatientIn seit {moment(patient.patientSince).format('DD. MMMM YYYY')}
            </span>
        }
      </div>
      {
        appointmentsWithSeparators.length > 6 && appendIfMany || null
      }
    </div>
  )
})
