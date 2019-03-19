import React from 'react'
import { timeSlots } from './timeSlots'
import { appointments as renderAppointments } from './appointments'
import { timeLegend } from './timeLegend'
import { blanks } from './blanks'
import { availabilities as renderAvailabilities } from './availabilities'
import { schedules } from './schedules'
import { overrideOverlay } from './overrideOverlay'

// row name    | column names
// ---------------------------------------------------------------
// [header]    | [time] [assignee-1] [assignee-2] ... [assignee-n]
// [8:00]      | [time] [assignee-1] [assignee-2] ... [assignee-n]
// [8:05]      | [time] [assignee-1] [assignee-2] ... [assignee-n]
// [8:10]      | [time] [assignee-1] [assignee-2] ... [assignee-n]
// ...         | ...
// [21:00]     | [time] [assignee-1] [assignee-2] ... [assignee-n]

export const AppointmentsGrid = ({ calendar, date, assignees, appointments, availabilities, onAppointmentClick, onBlankMouseEnter, onBlankClick, override, onScheduleModalOpen, move }) => {
  const slotSize = calendar.slotSize || 5
  const gridTimeSlots = timeSlots(slotSize).map((time) => `[${time}] 25px`).join(' ')

  const gridTemplateRows = `
    [header] 90px
    [subheader] 0px
    ${gridTimeSlots}
  `

  const style = {
    display: 'grid',
    position: 'relative',
    marginTop: 30,
    gridTemplateRows,
    gridTemplateColumns: `
      [time] 60px
      ${assignees.map((assignee, index) =>
    `[assignee-${assignee ? assignee._id : 'unassigned'}] 1fr`).join(' ')
}`
  }

  const ffAva = !!(window.location.hash.indexOf('ff-ava') !== -1)

  return (
    <div style={style}>
      {renderAppointments({ calendar, slotSize, appointments, onClick: onAppointmentClick, move })}
      {ffAva ? null : blanks({ calendar, date, assignees, onClick: onBlankClick, onMouseEnter: onBlankMouseEnter })}
      {ffAva ? renderAvailabilities({ calendar, date, availabilities, assignees, onClick: onBlankClick, onMouseEnter: onBlankMouseEnter }) : null}
      {ffAva ? null : overrideOverlay(override)}
      {ffAva ? null : schedules({ slotSize, assignees, date, calendar, onDoubleClick: onScheduleModalOpen })}
      {timeLegend({ slotSize })}
    </div>
  )
}
