import React from 'react'
import { timeSlots } from './timeSlots'
import { appointments } from './appointments'
import { timeLegend } from './timeLegend'
import { blanks } from './blanks'
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

export const AppointmentsGrid = ({ calendar, date, assignees, onAppointmentClick, onBlankMouseEnter, onBlankClick, override, onScheduleModalOpen, move }) => {
  const slotSize = calendar.slotSize || 5
  const gridTimeSlots = timeSlots(slotSize).map((time) => `[${time}] 25px`).join(' ')

  const gridTemplateRows = `
    [header] 60px
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
        `[assignee-${assignee.assigneeId}] 1fr`).join(' ')
      }`
  }

  return (
    <div style={style}>
      {appointments({ slotSize, assignees, onClick: onAppointmentClick, move })}
      {blanks({ slotSize, date, assignees, onClick: onBlankClick, onMouseEnter: onBlankMouseEnter })}
      {overrideOverlay(override)}
      {schedules({ slotSize, assignees, onDoubleClick: onScheduleModalOpen })}
      {timeLegend({ slotSize })}
    </div>

  )
}
