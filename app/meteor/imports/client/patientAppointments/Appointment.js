import React from 'react'
import { lighterMutedBackground, mutedBackground } from '../layout/styles'
import { Info } from './Info'
import { Tags } from './Tags'
import { Note } from './Note'
import { Media } from './Media'
import { ErrorBoundary } from '../layout/ErrorBoundary'
import { Calendars } from '../../api/calendars'
import { withProps } from 'recompose'
import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../util/meteor/hasRole'
import { CommentsContainer } from '../comments/CommentsContainer'

export const AppointmentsList = ({ appointments, fullNameWithTitle }) =>
  appointments.map(a =>
    <ErrorBoundary key={a._id}>
      <Appointment
        appointment={a}
        hasMedia={!!a.note}
        fullNameWithTitle={fullNameWithTitle}
      />
    </ErrorBoundary>
  )

export const Appointment = withProps(props => ({
  canSeeNote: hasRole(Meteor.userId(), ['appointments-note']),
  canSeeComments: hasRole(Meteor.userId(), ['appointments-comments']),
  calendar: props.appointment ? Calendars.findOne({ _id: props.appointment.calendarId }) : null
}))(({ calendar, isCurrent, hasMedia, appointment, fullNameWithTitle, canSeeNote, canSeeComments }) =>
  <div style={
    isCurrent
      ? currentAppointmentStyle
      : (
        (appointment.removed || appointment.canceled)
          ? removedAppointmentStyle
          : appointmentStyle
      )
  }>
    <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} calendar={calendar} />
    <Tags {...appointment} isCurrent={isCurrent} />

    {
      canSeeNote &&
        <Note {...appointment} isCurrent={isCurrent} />
    }

    {
      canSeeComments &&
        <CommentsContainer docId={appointment._id} />
    }

    {
      hasMedia && window.location.hash.indexOf('media') !== -1 &&
      <Media />
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

export const currentAppointmentStyle = {
  ...appointmentStyle,
  marginTop: 8,
  marginBottom: 12,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 5,
  paddingRight: 5,
  background: '#fff'
}

const removedAppointmentStyle = {
  ...appointmentStyle,
  background: lighterMutedBackground
}
