import max from 'lodash/max'
import { Users } from '../../users'
import { Calendars } from '../../calendars'
import { Schedules } from '../../schedules'
import { Tags } from '../../tags'

const defaultDuration = 5
const getCalendarDefaultDuration = calendarId => {
  const calendar = Calendars.findOne(calendarId)
  if (calendar && calendar.defaultAppointmentDuration) {
    return calendar.defaultAppointmentDuration
  } else {
    return defaultDuration
  }
}

export const isConstraintApplicable = ({ constraint, date }) => {
  if (constraint.hourStart && constraint.hourEnd) {
    return (constraint.hourStart <= date.hours() &&
    date.hours() <= constraint.hourEnd)
  } else {
    return true
  }
}

const getDurationConstraint = ({ calendarId, assigneeId, date }) => {
  if (!date || !assigneeId) {
    return getCalendarDefaultDuration(calendarId)
  }

  const constraint = Schedules.findOne({
    calendarId,
    type: 'constraint',
    userId: assigneeId,
    weekdays: date.clone().locale('en').format('ddd').toLowerCase(),
    start: { $lte: date.toDate() },
    end: { $gte: date.toDate() }
  })

  return (constraint && isConstraintApplicable({ constraint, date }) && constraint.duration) || getCalendarDefaultDuration(calendarId)
}

export const getDefaultDuration = ({ calendarId, assigneeId, date, tags }) => {
  let assigneeDuration
  let tagDurations = []

  if (assigneeId) {
    const user = Users.findOne({ _id: assigneeId })
    if (user && user.settings && user.settings.appointments && user.settings.appointments.defaultDuration) {
      assigneeDuration = user.settings.appointments.defaultDuration
    }
  }

  if (tags) {
    tagDurations = Tags.find({ _id: { $in: tags } }).fetch().map(t => t.duration)
  }

  const maxLength = max([
    assigneeDuration,
    ...tagDurations,
    getDurationConstraint({ calendarId, assigneeId, date })
  ])

  return maxLength || getCalendarDefaultDuration(calendarId)
}
