import React from 'react'
import { Routes } from 'react-router-dom'
import { AppointmentsContainer } from './dayView/AppointmentsContainer'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { route } from '../layout/SafeRoute'

export const Appointments = () => (
  <Routes>
    {route('day/:calendar/:date', AppointmentsContainer)}
    {route('day/:calendar', AppointmentsContainer)}
    {route(':calendar/:date', AppointmentsContainer)}
    {route(':calendar', AppointmentsContainer)}
    {route('*', Select)}
  </Routes>
)

const Select = () =>
  <CalendarSelect basePath='appointments' />
