import { toWeekday } from '../../../util/time/weekdays'
import { isWithinHMRange } from '../../../util/time/hm'

export const findConstraint = Constraints => ({ assigneeId, calendarId, time }) => {
  const dayConstraints = Constraints.find({
    calendarId,
    assigneeIds: assigneeId,
    weekdays: toWeekday(time)
  }).fetch()

  return dayConstraints.find(c =>
    (c.from || c.to)
      ? isWithinHMRange(c)(time)
      : true
  )
}
