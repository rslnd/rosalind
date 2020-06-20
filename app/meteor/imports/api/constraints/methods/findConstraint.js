import { toWeekday } from '../../../util/time/weekdays'
import { isWithinHMRange } from '../../../util/time/hm'
import { isValidAt } from '../../../util/time/valid'

export const findConstraint = Constraints => ({ assigneeId, calendarId, time }) => {
  const dayConstraints = Constraints.find({
    calendarId,
    assigneeIds: assigneeId,
    weekdays: toWeekday(time)
  }, {
    sort: {
      order: 1
    }
  }).fetch()

  return dayConstraints.find(c =>
    isValidAt(c)(time) &&
    (c.from || c.to)
      ? isWithinHMRange(c)(time)
      : true
  )
}
