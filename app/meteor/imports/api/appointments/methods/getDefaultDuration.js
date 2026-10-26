import { Meteor } from 'meteor/meteor'
import { Calendars } from '../../calendars'
import { Constraints } from '../../constraints'
import { findConstraint } from '../../constraints/methods/findConstraint'
import { applyConstraintToTags } from '../../constraints/methods/applyConstraintToTags'
import { Tags } from '../../tags'
import { isWithinHMRange } from '../../../util/time/hm'
import { applyDurationStrategy } from './durationStrategy'
import { isValidAt } from '../../../util/time/valid'

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

// Client: synchronous (reactive minimongo) so it can be used in trackers/render.
// Server: async. Server callers must `await getDefaultDuration(...)`.
const getDefaultDurationServer = async ({ calendarId, assigneeId, date, tags = [] }) => {
  const didSelectScheduleableTags = tags.find(t => t && t.scheduleable)

  let selectedTags = await Promise.all(tags.map(async t => (typeof t === 'string') ? await Tags.findOneAsync({ _id: t }, { removed: true }) : t))
  let constraint = null

  if (!didSelectScheduleableTags) {
    const unconstrainedTags = await Tags.find({ _id: { $in: tags } }, { removed: true }).fetchAsync()
    constraint = await findConstraint(Constraints)({ calendarId, assigneeId, time: date })
    const constrainedTags = constraint && (unconstrainedTags.length >= 1) &&
      applyConstraintToTags({ constraint, tags: unconstrainedTags })

    if (constrainedTags && constrainedTags.length >= 1) {
      selectedTags = constrainedTags
    }
  }

  const duration = applyDurationStrategy({ calendarId, constraint, tags: selectedTags })

  if (duration) { return duration }
  const calendar = await Calendars.findOneAsync(calendarId)
  return (calendar && calendar.defaultDuration) || null
}

const getDefaultDurationClient = ({ calendarId, assigneeId, date, tags = [] }) => {
  const didSelectScheduleableTags = tags.find(t => t && t.scheduleable)

  let selectedTags = tags.map(t => (typeof t === 'string') ? Tags.findOne({ _id: t }, { removed: true }) : t)
  let constraint = null

  if (!didSelectScheduleableTags) {
    const unconstrainedTags = Tags.find({ _id: { $in: tags } }, { removed: true }).fetch()
    constraint = findConstraint(Constraints)({ calendarId, assigneeId, time: date })
    const constrainedTags = constraint && (unconstrainedTags.length >= 1) &&
      applyConstraintToTags({ constraint, tags: unconstrainedTags })

    if (constrainedTags && constrainedTags.length >= 1) {
      selectedTags = constrainedTags
    }
  }

  const duration = applyDurationStrategy({ calendarId, constraint, tags: selectedTags })

  if (duration) { return duration }
  const calendar = Calendars.findOne(calendarId)
  return (calendar && calendar.defaultDuration) || null
}

export const getDefaultDuration = Meteor.isServer ? getDefaultDurationServer : getDefaultDurationClient
