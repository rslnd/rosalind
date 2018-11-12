import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import { toWeekday } from '../../../util/time/weekdays'
import { isWithinHMRange } from '../../../util/time/hm'

// Returns a union of tag ids that may be possible to schedule within the given availability
export const getPossibleTags = ({ availability, tags, constraints }) => {
  const constrainedTags = flatten(
    constraints
      .filter(constraint => isConstraintApplicable({ constraint, availability }))
      .map(c => tags.filter(t => c.tags && c.tags.includes(t._id)))
  )

  if (constrainedTags && constrainedTags.length >= 1) {
    return uniq(constrainedTags.map(t => t._id))
  }

  // If no constraints match, return default tags for calendar
  return tags.filter(t =>
    (t.assigneeIds && t.assigneeIds.length >= 1 &&
      t.assigneeIds.includes(availability.assigneeId)) ||
    (
      (t.blacklistAssigneeIds && t.blacklistAssigneeIds.length >= 1 &&
        t.blacklistAssigneeIds.includes(availability.assigneeId))
      ? false
      : (t.calendarIds && t.calendarIds.length >= 1)
      ? t.calendarIds.includes(availability.calendarId)
      : false
    )
  ).map(t => t._id)
}

const isConstraintApplicable = ({ availability, constraint }) => {
  const { from, to, ...c } = constraint

  return !c.removed &&
    c.calendarId ? c.calendarId === availability.calendarId : true &&
    c.tags && c.tags.length >= 1 &&
    c.assigneeIds && c.assigneeIds.includes(availability.assigneeId) &&
    c.weekdays ? c.weekdays.includes(toWeekday(availability.from)) : true &&
    (
      // BUG: Naive check ignores partially overlapping constraints
      isWithinHMRange({ from, to })(availability.from) ||
      isWithinHMRange({ from, to })(availability.to)
    )
}
