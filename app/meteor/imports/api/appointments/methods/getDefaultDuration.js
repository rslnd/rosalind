import max from 'lodash/max'
import { Users } from '../../users'
import { Calendars } from '../../calendars'
import { Constraints } from '../../constraints'
import { findConstraint } from '../../constraints/methods/findConstraint'
import { applyConstraintToTags } from '../../constraints/methods/applyConstraintToTags'
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

export const getDefaultDuration = ({ calendarId, assigneeId, date, tags = [] }) => {
  let constrainedDuration = null

  if (tags.length >= 1) {
    const constraint = findConstraint(Constraints)({ calendarId, assigneeId, time: date })
    const constrainedTags = applyConstraintToTags({
      constraint,
      tags: Tags.find({ _id: { $in: tags } }).fetch()
    })

    const tagDurations = (constrainedTags.length >= 1 ? constrainedTags : tags).map(t => t.duration)

    // TODO: Apply durationStrategy from constraint here
    constrainedDuration = max(tagDurations)
  }

  const defaultDuration = getCalendarDefaultDuration(calendarId)

  return constrainedDuration || defaultDuration
}
