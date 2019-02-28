import uniq from 'lodash/uniq'
import flatten from 'lodash/flatten'
import { toWeekday } from '../../../util/time/weekdays'
import { isWithinHMRange } from '../../../util/time/hm'

// Returns a union of tag ids that may be possible to schedule within the given availability
export const getPossibleTags = ({ availability, tags, constraints }) => {
  const constrainedTags = flatten(
    constraints
      .filter(constraint => isConstraintApplicable({ constraint, availability }))
      .map(c => tags.filter(t => c.tags && c.tags.map(t => t.tagId).includes(t._id)))
  )

  if (constrainedTags && constrainedTags.length >= 1) {
    const result = uniq(constrainedTags.map(t => t._id))
    return result
  }

  const isListed = (list, item) =>
    list && list.length >= 1 && list.includes(item)

  const isWhitelisted = (t, a) =>
    isListed(t.assigneeIds, a.assigneeId)

  const hasWhitelist = t =>
    t.assigneeIds && t.assigneeIds.length >= 1

  const isBlacklisted = (t, a) =>
    isListed(t.blacklistAssigneeIds, a.assigneeId)

  const isCalendar = (t, a) =>
    isListed(t.calendarIds, a.calendarId)

  // If no constraints match, return default tags for calendar
  const result = tags.filter(t =>
    (
      !(hasWhitelist(t) && !isWhitelisted(t, availability)) &&
      isCalendar(t, availability) &&
      !isBlacklisted(t, availability)
    )
  ).map(t => t._id)

  return result
}

const isConstraintApplicable = ({ availability, constraint }) => {
  const { from, to, ...c } = constraint

  const isApplicable = (!c.removed) &&
    (c.calendarId ? c.calendarId === availability.calendarId : true) &&
    (c.tags && c.tags.length >= 1) &&
    (c.assigneeIds && c.assigneeIds.includes(availability.assigneeId)) &&
    (c.weekdays ? c.weekdays.includes(toWeekday(availability.from)) : true) &&
    ((from && to) ? (
      // BUG: Naive check ignores partially overlapping constraints
      isWithinHMRange({ from, to })(availability.from) ||
      isWithinHMRange({ from, to })(availability.to)
    ) : true)

  return isApplicable
}
