import React from 'react'
import { label, timeSlots } from './timeSlots'
import { appointments as renderAppointments } from './appointments'
import { timeLegend } from './timeLegend'
import { blanks } from './blanks'
import { availabilities as renderAvailabilities } from './availabilities'
import { schedules as renderSchedules } from './schedules'
import { overrideOverlay } from './overrideOverlay'
import { ErrorBoundary } from '../../../layout/ErrorBoundary'
import moment from 'moment-timezone'
import { sortBy } from 'lodash'
import { Icon } from '../../../components/Icon'
import { durationFormat } from '../../../reports/shared/durationFormat'

// row name    | column names
// ---------------------------------------------------------------
// [header]    | [time] [assignee-1] [assignee-2] ... [assignee-n]
// [8:00]      | [time] [assignee-1] [assignee-2] ... [assignee-n]
// [8:05]      | [time] [assignee-1] [assignee-2] ... [assignee-n]
// [8:10]      | [time] [assignee-1] [assignee-2] ... [assignee-n]
// ...         | ...
// [21:00]     | [time] [assignee-1] [assignee-2] ... [assignee-n]

export const AppointmentsGrid = ({
  calendar,
  date,
  assignees,
  appointments,
  availabilities,
  schedules,
  onAppointmentClick,
  onBlankMouseEnter,
  onBlankClick,
  override,
  onScheduleModalOpen,
  move,
  canSeeBookables,
  canEditBookables
}) => {
  const { scheduleOffset, atMinutes } = calendar
  const slotSize = calendar.slotSize || 5
  const gridTimeSlots = timeSlots(slotSize, scheduleOffset, atMinutes)

  const gridTemplateRows = `
    [header] 140px
    [subheader] 0px
    ${gridTimeSlots.map((time) => `[${time}] 25px`).join(' ')}
  `

  const style = {
    display: 'grid',
    position: 'relative',
    marginTop: 30,
    gridTemplateRows,
    gridTemplateColumns: `
      [time] 50px
      ${assignees.map((assignee, index) =>
    `[assignee-${assignee ? assignee._id : 'unassigned'}] 1fr`).join(' ')
}`
  }

  const ffAva = !!(window.location.hash.indexOf('ff-ava') !== -1)

  return (
    <div style={style}>
      <ErrorBoundary silent name='AppG Counts'>
        {renderCounts({ date, calendar, assignees, appointments, schedules, gridTimeSlots })}
      </ErrorBoundary>

      {renderAppointments({ calendar, slotSize, scheduleOffset, atMinutes, appointments, onClick: onAppointmentClick, move, canSeeBookables, canEditBookables })}
      {ffAva ? null : blanks({ calendar, date, assignees, onClick: onBlankClick, onMouseEnter: onBlankMouseEnter, canSeeBookables, canEditBookables })}
      {ffAva ? renderAvailabilities({ calendar, date, availabilities, assignees, onClick: onBlankClick, onMouseEnter: onBlankMouseEnter }) : null}
      {ffAva ? null : overrideOverlay(override)}
      {ffAva ? null : renderSchedules({ slotSize, schedules, assignees, date, calendar, onDoubleClick: onScheduleModalOpen, override })}
      {timeLegend({ slotSize, scheduleOffset, atMinutes })}
    </div>
  )
}

const renderCounts = ({ date, assignees, calendar, appointments, schedules, gridTimeSlots }) => {
  const { showCounts, slotSize, slotSizeAppointment, allowUnassigned, atMinutes } = calendar
  if (!showCounts) { return null }


  const labeledAppointments = appointments.map(a => {
    return {
      ...a,
      startLabel: label(moment(a.start)),
      endLabel: label(moment(a.end))
    }
  })


  return assignees.map(assignee => {
    if (!assignee && !allowUnassigned) { return }

    const assigneeId = assignee ? assignee._id : null

    // const scheduleOffset = slotSizeAppointment &&
    //   (assignee && assignee.schedules && assignee.schedules.length >= 1) &&
    //   moment(sortBy(assignee.schedules, 'end')[0].end).add(1, 'second').minute()

    // const slotSizeBlank = (scheduleOffset === 0 || scheduleOffset > 0)
    //   ? slotSizeAppointment
    //   : slotSize

    // const slots = timeSlots(slotSizeBlank, scheduleOffset, atMinutes)

    const assigneeAppointments = labeledAppointments.filter(ap =>
      (ap.assigneeId === assigneeId) &&
      (ap.type !== 'bookable')
    )

    const admittedCount = assigneeAppointments.filter(ap => ap.admittedAt).length
    const noShowCount = assigneeAppointments.length - admittedCount


    const assigneeSchedules = sortBy(schedules.filter(s => (
      (s.userId === assigneeId) &&
      (s.calendarId === calendar._id) &&
      !s.available &&
      (!s.roles || s.roles.length === 0)
    )), 'start')

    const blockedMs = assigneeSchedules.reduce((acc, s) => (acc + (s.end - s.start)), 0)
    const apptMs = assigneeAppointments.reduce((acc, a) => (acc + (a.end - a.start)), 0)

    const wholeDayMs = assigneeSchedules.length >= 2
      ? (assigneeSchedules[assigneeSchedules.length - 1].end - assigneeSchedules[0].start)
      : ((22 - 7.5 - 1) * 60 * 60 * 1000)

    const wholeDayHrs = durationFormat(wholeDayMs - blockedMs, 'ms')
    const freeHrs =  durationFormat(wholeDayMs - blockedMs - apptMs, 'ms')


    console.log({ assigneeSchedules: assigneeSchedules.length,
       assigneeAppointments: assigneeAppointments.length,
       blockedMs: durationFormat(blockedMs, 'ms'),
       apptMs: durationFormat(apptMs, 'ms'),
       wholeDayMs: durationFormat(wholeDayMs, 'ms'),
       freeHrs })

    // let gridTimeSlots2 =
    // for (let i = 0; i < gridTimeSlots.length; i++) {
    //   // punch away grid time slots
    // }



    // assigneeAppointments.map(ap => {

    //   slots.indexOf(ap.startLabel)

    // })

    const text = '' // assigneeSchedules.length

    // console.log(slots)

    const style = {
      opacity: 0.8,
      paddingBottom: '1em',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'end',
      textAlign: 'center',
      overflow: 'ellipse',
      gridRow: 'header',
      gridColumn: `assignee-${assigneeId || 'unassigned'}`,
    }
    return <>
      <div style={style} className='enable-select text-muted'>
        <span>
          {(assigneeId &&
            <>{freeHrs} frei von {wholeDayHrs} <br/></>)}


          {
            moment().isSameOrAfter(date, 'day')
            ? <>{admittedCount} <Icon name="check" /> &emsp; {noShowCount} <Icon name="times" /></>
            : <>{admittedCount + noShowCount} <Icon name="user" /></>
          }


        </span>
        <br />
        {text}

      </div>
    </>
  })
}
