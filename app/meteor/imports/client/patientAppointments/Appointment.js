import React from 'react'
import { lighterMutedBackground } from '../layout/styles'
import { Info } from './Info'
import { Tags } from './Tags'
import { Note } from './Note'
import { Media } from './Media'
import { ErrorBoundary } from '../layout/ErrorBoundary'
import { Calendars } from '../../api/calendars'
import { withProps } from 'recompose'

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
  calendar: props.appointment ? Calendars.findOne({ _id: props.appointment.calendarId }) : null
}))(({ calendar, isCurrent, hasMedia, appointment, fullNameWithTitle }) =>
  <div style={
    isCurrent
      ? currentAppointmentStyle
      : appointmentStyle
  }>
    <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} calendar={calendar} />
    <Tags {...appointment} isCurrent={isCurrent} />
    <Note {...appointment} />

    {
      hasMedia &&
      <Media />
    }
  </div>
)

export const appointmentStyle = {
  borderRadius: 4,
  background: lighterMutedBackground,
  margin: 12
}

export const currentAppointmentStyle = {
  ...appointmentStyle,
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 5,
  paddingRight: 5,
  background: '#fff'
}
