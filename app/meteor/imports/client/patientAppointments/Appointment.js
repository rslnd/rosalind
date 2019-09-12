import React from 'react'
import { lighterMutedBackground, mutedBackground } from '../layout/styles'
import { Info } from './Info'
import { Tags } from './Tags'
import { Note } from './Note'
import { Media } from './Media'
import { ErrorBoundary } from '../layout/ErrorBoundary'
import { Calendars } from '../../api/calendars'
import { withProps, compose } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../util/meteor/hasRole'
import { CommentsContainer } from '../comments/CommentsContainer'

export const AppointmentsList = ({ appointments, fullNameWithTitle }) =>
  appointments.map(a =>
    <ErrorBoundary key={a._id}>
      <Appointment
        appointment={a}
        fullNameWithTitle={fullNameWithTitle}
      />
    </ErrorBoundary>
  )

export const Appointment = compose(
  withProps(props => ({
    canSeeNote: hasRole(Meteor.userId(), ['appointments-note']),
    canSeeComments: hasRole(Meteor.userId(), ['appointments-comments']),
    collapseComments: hasRole(Meteor.userId(), ['appointments-commentsCollapse']),
    calendar: props.appointment ? Calendars.findOne({ _id: props.appointment.calendarId }) : null
  }))
)(({ calendar, isCurrent, appointment, fullNameWithTitle, canSeeNote, canSeeComments, collapseComments }) =>
  <div style={
    isCurrent
      ? currentAppointmentStyle
      : (
        (appointment.removed || appointment.canceled)
          ? removedAppointmentStyle
          : appointmentStyle
      )
  }>
    <div style={isCurrent ? currentAppointmentInnerStyle : null}>
      <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} calendar={calendar} />
      <Tags {...appointment} isCurrent={isCurrent} />

      {
        canSeeNote &&
          <Note {...appointment} isCurrent={isCurrent} />
      }

      {
        canSeeComments &&
          <CommentsContainer docId={appointment._id}
            collapsed={collapseComments}
          />
      }
    </div>

    {
      isCurrent && window.location.hash.indexOf('media') !== -1 &&
      <Media appointment={appointment} />
    }
  </div>
)

export const appointmentStyle = {
  borderRadius: 4,
  background: mutedBackground,
  marginLeft: 12,
  marginRight: 12,
  marginTop: 4,
  marginBottom: 4
}

const currentAppointmentStyle = {
  ...appointmentStyle,
  marginTop: 8,
  marginBottom: 12,
  background: '#fff'
}

export const currentAppointmentInnerStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 5,
  paddingRight: 5
}

const removedAppointmentStyle = {
  ...appointmentStyle,
  background: lighterMutedBackground
}
