import React from 'react'
import { lighterMutedBackground } from '../layout/styles'
import { Info } from './Info'
import { Tags } from './Tags'
import { Note } from './Note'
import { Media } from './Media'

export const AppointmentsList = ({ appointments, fullNameWithTitle }) =>
  appointments.map(a =>
    <Appointment
      key={a._id}
      appointment={a}
      hasMedia={!!a.note}
      fullNameWithTitle={fullNameWithTitle}
    />
  )

export const Appointment = ({ isCurrent, hasMedia, appointment, fullNameWithTitle }) =>
  <div style={
    isCurrent
      ? currentAppointmentStyle
      : appointmentStyle
  }>
    <Info appointment={appointment} fullNameWithTitle={fullNameWithTitle} />
    <Tags {...appointment} tiny={!isCurrent} />
    <Note {...appointment} />

    {
      hasMedia &&
      <Media />
    }
  </div>

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
