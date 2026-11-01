import React from 'react'
import { Routes } from 'react-router-dom'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { SchedulesDefaultScreen } from './default/SchedulesDefaultScreen'
import { HolidaysContainer } from './holidays/HolidaysContainer'
import { ConstraintsContainer } from './constraints/ConstraintsContainer'
import { route } from '../layout/SafeRoute'

export const Schedules = () => (
  <div>
    <Routes>
      {route('default/:slug', SchedulesDefaultScreen)}
      {route('default', Select)}
      {route('holidays', HolidaysContainer)}
      {route('constraints', ConstraintsContainer)}
      {route('*', Select)}
    </Routes>
  </div>
)

const Select = () =>
  <div>
    <div className='content-header'>
      <h1>Arbeitszeiten festlegen</h1>
    </div>
    <CalendarSelect basePath='schedules/default' />
  </div>
