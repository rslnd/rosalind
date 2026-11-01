import leftPad from 'left-pad'
import { calendarSlotMinutes } from '../../appointments/methods/ceilToSlot'

const toMin = hm => hm.h * 60 + (hm.m || 0)

const fmt = hm => `${hm.h}:${leftPad(hm.m || 0, 2, '0')}`

const weekdayLabels = {
  mon: 'Mo', tue: 'Di', wed: 'Mi', thu: 'Do', fri: 'Fr', sat: 'Sa', sun: 'So'
}

// Problems of a single default schedule block ({ from, to }) for a calendar,
// as human readable (German) messages. Empty when the block is fine.
//
// Block boundaries must lie on the day view grid (slot size or the calendar's
// atMinutes), otherwise applying the default schedule creates blocked times
// and online bookable slots that do not line up with the rows of the day view.
export const defaultScheduleProblems = ({ calendar, schedule }) => {
  if (!schedule || !schedule.from || !schedule.to) { return [] }

  const problems = []

  if (toMin(schedule.to) <= toMin(schedule.from)) {
    problems.push(`Ende (${fmt(schedule.to)}) muss nach Beginn (${fmt(schedule.from)}) liegen`)
  }

  const minutes = calendarSlotMinutes(calendar)
  const offGrid = [schedule.from, schedule.to].filter(hm => minutes.indexOf(hm.m || 0) === -1)
  if (offGrid.length >= 1) {
    problems.push(`${offGrid.map(fmt).join(' und ')} ${offGrid.length === 1 ? 'liegt' : 'liegen'} nicht im Terminraster (Minuten ${minutes.map(m => ':' + leftPad(m, 2, '0')).join(', ')})`)
  }

  return problems
}

// One-line description of a default schedule block, eg. "Di 8:00–12:05"
export const describeDefaultSchedule = (schedule) =>
  `${weekdayLabels[schedule.weekday] || schedule.weekday} ${fmt(schedule.from)}–${fmt(schedule.to)}`

// All invalid default schedules: [{ schedule, problems }]
export const invalidDefaultSchedules = ({ calendar, defaultSchedules }) =>
  defaultSchedules
    .map(schedule => ({ schedule, problems: defaultScheduleProblems({ calendar, schedule }) }))
    .filter(({ problems }) => problems.length >= 1)
