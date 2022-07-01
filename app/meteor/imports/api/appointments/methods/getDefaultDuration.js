import { Calendars } from '../../calendars'
import { Constraints } from '../../constraints'
import { findConstraint } from '../../constraints/methods/findConstraint'
import { applyConstraintToTags } from '../../constraints/methods/applyConstraintToTags'
import { Tags } from '../../tags'
import { isWithinHMRange } from '../../../util/time/hm'
import { applyDurationStrategy } from './durationStrategy'
import { isValidAt } from '../../../util/time/valid'

const getCalendarDefaultDuration = calendarId => {
  const calendar = Calendars.findOne(calendarId)
  if (calendar && calendar.defaultDuration) {
    return calendar.defaultDuration
  } else {
    return null
  }
}

export const isConstraintApplicable = ({ constraint, date }) => {
  const { from, to } = constraint

  if (!isValidAt(constraint)(date)) {
    return false
  }

  if (from && to) {
    return isWithinHMRange({ from, to })(date)
  } else {
    return true
  }
}

export const getDefaultDuration = ({ calendarId, assigneeId, date, tags = [] }) => {
  const didSelectScheduleableTags = tags.find(t => t.scheduleable)

  let selectedTags = tags.map(t => (typeof t === 'string') ? Tags.findOne({ _id: t}) : t)
  let constraint = null

  if (!didSelectScheduleableTags) {
    const unconstrainedTags = Tags.find({ _id: { $in: tags } }).fetch()
    constraint = findConstraint(Constraints)({ calendarId, assigneeId, time: date })
    const constrainedTags = constraint && (unconstrainedTags.length >= 1) &&
      applyConstraintToTags({
        constraint,
        tags: unconstrainedTags
      })

    if (constrainedTags && constrainedTags.length >= 1) {
      selectedTags = constrainedTags
    }
  }

  const duration = applyDurationStrategy({
    calendarId,
    constraint,
    tags: selectedTags
  })

  return duration || getCalendarDefaultDuration({ calendarId })
}
