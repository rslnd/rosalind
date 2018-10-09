import max from 'lodash/max'
import { Users } from '../../users'
import { Calendars } from '../../calendars'
import { Constraints } from '../../constraints'
import { Tags } from '../../tags'
import { toWeekday } from '../../../util/time/weekdays'
import { isWithinHMRange } from '../../../util/time/hm'

const defaultDuration = 5
const getCalendarDefaultDuration = calendarId => {
  const calendar = Calendars.findOne(calendarId)
  if (calendar && calendar.defaultDuration) {
    return calendar.defaultDuration
  } else {
    return defaultDuration
  }
}

export const isConstraintApplicable = ({ constraint, date }) => {
  const { from, to } = constraint
  if (from && to) {
    return isWithinHMRange({ from, to })(date)
  } else {
    return true
  }
}

const getDurationConstraint = ({ calendarId, assigneeId, date }) => {
  if (!date || !assigneeId) {
    return getCalendarDefaultDuration(calendarId)
  }

  const constraint = Constraints.findOne({
    calendarId,
    assigneeIds: assigneeId,
    weekdays: toWeekday(date)
  })

  return (constraint && isConstraintApplicable({ constraint, date }) && constraint.duration) || getCalendarDefaultDuration(calendarId)
}

export const getDefaultDuration = ({ calendarId, assigneeId, date, tags }) => {
  let tagDurations = []

  if (tags) {
    tagDurations = Tags.find({ _id: { $in: tags } }).fetch().map(t => t.duration)
  }

  const maxDuration = max(tagDurations)

  const durationConstraint = getDurationConstraint({ calendarId, assigneeId, date })
  const defaultDuration = getCalendarDefaultDuration(calendarId)

  if (durationConstraint === defaultDuration) {
    return maxDuration || defaultDuration
  } else {
    return durationConstraint
  }
}
