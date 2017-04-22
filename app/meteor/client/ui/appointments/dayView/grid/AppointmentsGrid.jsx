import { timeSlots } from './timeSlots'
import { appointments } from './appointments'
import { timeLegend } from './timeLegend.jsx'
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

const gridTimeSlots = timeSlots.map((time) => `[${time}] 25px`).join(' ')

const gridTemplateRows = `
  [header] 40px
  [subheader] 40px
  ${gridTimeSlots}
`

export const AppointmentsGrid = ({ date, assignees, onAppointmentClick, onBlankMouseEnter, onBlankClick, override, onScheduleModalOpen, isMoving, moveToTime, moveToAssigneeId, moveAppointmentId }) => {
  const style = {
    display: 'grid',
    position: 'relative',
    top: 0,
    gridTemplateRows,
    gridTemplateColumns: `
      [time] 60px
      ${assignees.map((assignee, index) =>
        `[assignee-${assignee.assigneeId}] 1fr`).join(' ')
      }`
  }

  return (
    <div style={style}>
      {appointments({ assignees, onClick: onAppointmentClick, isMoving, moveToTime, moveToAssigneeId, moveAppointmentId })}
      {blanks({ date, assignees, onClick: onBlankClick, onMouseEnter: onBlankMouseEnter })}
      {overrideOverlay(override)}
      {schedules({ assignees, onDoubleClick: onScheduleModalOpen })}
      {timeLegend()}
    </div>

  )
}
