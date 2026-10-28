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

// Shared, pure part of the duration algorithm. Only the data loading differs
// between client and server, so keep any logic changes in here.
const isScheduleableSelection = tags => tags.find(t => t && t.scheduleable)

const pickTags = ({ selectedTags, unconstrainedTags, constraint }) => {
  const constrainedTags = constraint && unconstrainedTags && (unconstrainedTags.length >= 1) &&
    applyConstraintToTags({ constraint, tags: unconstrainedTags })

  return (constrainedTags && constrainedTags.length >= 1)
    ? constrainedTags
    : selectedTags
}

const fallbackDuration = calendar =>
  (calendar && calendar.defaultDuration) || null

// Client: synchronous (reactive minimongo) so it can be used in trackers/render.
// Server: async. Server callers must `await getDefaultDuration(...)`.
const getDefaultDurationServer = async ({ calendarId, assigneeId, date, tags = [] }) => {
  const selectedTags = await Promise.all(tags.map(t => (typeof t === 'string') ? Tags.findOneAsync({ _id: t }, { removed: true }) : t))
  let constraint = null
  let unconstrainedTags = null

  if (!isScheduleableSelection(tags)) {
    unconstrainedTags = await Tags.find({ _id: { $in: tags } }, { removed: true }).fetchAsync()
    constraint = await findConstraint(Constraints)({ calendarId, assigneeId, time: date })
  }

  const duration = applyDurationStrategy({
    calendarId,
    constraint,
    tags: pickTags({ selectedTags, unconstrainedTags, constraint })
  })

  return duration || fallbackDuration(await Calendars.findOneAsync(calendarId))
}

const getDefaultDurationClient = ({ calendarId, assigneeId, date, tags = [] }) => {
  const selectedTags = tags.map(t => (typeof t === 'string') ? Tags.findOne({ _id: t }, { removed: true }) : t)
  let constraint = null
  let unconstrainedTags = null

  if (!isScheduleableSelection(tags)) {
    unconstrainedTags = Tags.find({ _id: { $in: tags } }, { removed: true }).fetch()
    constraint = findConstraint(Constraints)({ calendarId, assigneeId, time: date })
  }

  const duration = applyDurationStrategy({
    calendarId,
    constraint,
    tags: pickTags({ selectedTags, unconstrainedTags, constraint })
  })

  return duration || fallbackDuration(Calendars.findOne(calendarId))
}

export const getDefaultDuration = Meteor.isServer ? getDefaultDurationServer : getDefaultDurationClient
