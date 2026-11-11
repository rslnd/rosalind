import React from 'react'
import moment from 'moment-timezone'
import { sortBy } from 'lodash'
import { timeSlots, setTime } from './timeSlots'
import { Icon } from '../../../components/Icon'
import { durationFormat } from '../../../reports/shared/durationFormat'

// Free time, free slots and admitted/no-show counts of one column (assignee or
// the unassigned "Einschub" column, assignee = null) of the day view.
export const columnCounts = ({ date, calendar, assignee, appointments, schedules }) => {
  const { slotSize, slotSizeAppointment, atMinutes } = calendar
  const assigneeId = assignee ? assignee._id : null

  const assigneeAppointments = appointments.filter(ap =>
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
  const freeHrs = durationFormat(wholeDayMs - blockedMs - apptMs, 'ms')

  // Slot counts: honor slot size and atMinutes, matching the bookable "blanks".
  // A slot is available when it is not inside a blocking schedule, and free
  // when it is additionally not covered by a (non-bookable) appointment.
  // Server-side counterpart: api/schedules/methods/headerSlots.js
  const scheduleOffset = slotSizeAppointment &&
    (assignee && assignee.schedules && assignee.schedules.length >= 1) &&
    moment(sortBy(assignee.schedules, 'end')[0].end).add(1, 'second').minute()

  const slotSizeBlank = (scheduleOffset === 0 || scheduleOffset > 0)
    ? slotSizeAppointment
    : (slotSize || 5)

  const slotTimes = timeSlots(slotSizeBlank, scheduleOffset, atMinutes)
    .map(l => setTime(l)(moment(date)).toDate())

  const isBlocked = t => assigneeSchedules.some(s => (t >= s.start && t < s.end))
  const isOccupied = t => assigneeAppointments.some(a => (t >= a.start && t < a.end))

  const availableSlots = slotTimes.filter(t => !isBlocked(t))
  const totalSlots = availableSlots.length
  const freeSlots = availableSlots.filter(t => !isOccupied(t)).length

  return { freeHrs, wholeDayHrs, freeSlots, totalSlots, admittedCount, noShowCount }
}

// The three lines shown in a column header ("0:45 frei von 3:50" …).
// `withFree` controls the first two lines (hidden in the Einschub column header).
export const ColumnCounts = ({ date, counts, withFree = true }) => {
  const { freeHrs, wholeDayHrs, freeSlots, totalSlots, admittedCount, noShowCount } = counts
  return (
    <span>
      {withFree &&
        <>{freeHrs} frei von {wholeDayHrs} <br /></>}

      {withFree &&
        <><b>{freeSlots}</b> frei von {totalSlots} Slots <br /></>}

      {
        moment().isSameOrAfter(date, 'day')
          ? (
            <>
              <span title={`${admittedCount} PatientInnen erschienen`} style={{ cursor: 'default' }}>{admittedCount} <Icon name='check' /></span>
              &emsp;
              <span title={`${noShowCount} PatientInnen nicht erschienen`} style={{ cursor: 'default' }}>{noShowCount} <Icon name='times' /></span>
            </>
            )
          : <span title={`${admittedCount + noShowCount} belegte Slots`} style={{ cursor: 'default' }}>{admittedCount + noShowCount} <Icon name='user' /></span>
      }
    </span>
  )
}
