import { Meteor } from 'meteor/meteor'
import { toWeekday } from '../../../util/time/weekdays'
import { isWithinHMRange } from '../../../util/time/hm'
import { isValidAt } from '../../../util/time/valid'

const pick = (dayConstraints, time) =>
  dayConstraints.find(c =>
    isValidAt(c)(time) &&
    (c.from || c.to)
      ? isWithinHMRange(c)(time)
      : true
  )

// Client: synchronous (reactive minimongo). Server: async.
export const findConstraint = Constraints => Meteor.isServer
  ? async ({ assigneeId, calendarId, time }) => {
    const dayConstraints = await Constraints.find({
      calendarId,
      assigneeIds: assigneeId,
      weekdays: toWeekday(time)
    }, { sort: { order: 1 } }).fetchAsync()
    return pick(dayConstraints, time)
  }
  : ({ assigneeId, calendarId, time }) => {
    const dayConstraints = Constraints.find({
      calendarId,
      assigneeIds: assigneeId,
      weekdays: toWeekday(time)
    }, { sort: { order: 1 } }).fetch()
    return pick(dayConstraints, time)
  }
