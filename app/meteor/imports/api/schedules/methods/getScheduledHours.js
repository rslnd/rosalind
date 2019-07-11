import _moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import flatten from 'lodash/flatten'
import { dayToDate } from '../../../util/time/day'

const moment = extendMoment(_moment)

// TODO: Get rid of the hard coded durations
const AM_HOURS = 6
const PM_HOURS = 7.5
const DAY_HOURS = AM_HOURS + PM_HOURS

export const cutoffAt = x => moment.tz(moment(x).clone(), 'Europe/Vienna').startOf('day').hour(13).minute(30)

export const splitCutoff = ({ overrideSchedules = [] }) => {
  return flatten(overrideSchedules.map(o => {
    const blockedRange = moment.range(o.start, o.end)
    const cutoff = cutoffAt(o.start)

    if (blockedRange.contains(cutoff)) {
      return [
        { ...o, end: cutoff.toDate() },
        { ...o, start: cutoff.toDate() }
      ]
    } else {
      return o
    }
  }))
}

export const isAM = s =>
  moment(s.start).isBefore(cutoffAt(s.start))

export const isPM = s => !isAM(s)

export const calculateScheduledHoursAM = ({ overrideSchedules }) =>
  calculateScheduledHours({
    overrideSchedules: splitCutoff({ overrideSchedules }).filter(isAM),
    dayHours: AM_HOURS
  })

export const calculateScheduledHoursPM = ({ overrideSchedules }) =>
  calculateScheduledHours({
    overrideSchedules: splitCutoff({ overrideSchedules }).filter(isPM),
    dayHours: PM_HOURS
  })

export const calculateScheduledHours = ({ dayHours = DAY_HOURS, overrideSchedules = [] }) => {
  if (overrideSchedules.length === 0) {
    return dayHours
  }

  // Calculate the durations of each blocking override
  const blockedDurations = overrideSchedules.map((schedule) =>
    moment.range(schedule.start, schedule.end).duration() / 1000 / 60
  )

  // Add them up
  const blockedMinutes = blockedDurations.reduce((prev, curr) => (prev + curr), 0)

  // Subtract the blocked minutes from the duration of the day
  const dayDuration = 60 * dayHours

  // Convert minutes to decimal hours
  const scheduledHours = (dayDuration - blockedMinutes) / 60

  return Math.round(100 * scheduledHours) / 100
}

export default ({ Schedules }) => {
  const getScheduledHours = ({ day, userId }) => {
    const date = moment(dayToDate(day))
    const overrideSchedules = Schedules.find({
      type: 'override',
      start: { $gt: date.startOf('day').toDate() },
      end: { $lt: date.endOf('day').toDate() },
      userId
    }).fetch()

    return calculateScheduledHours({ overrideSchedules })
  }

  return {
    getScheduledHours
  }
}
