import moment from 'moment-timezone'
import { Constraints } from '../../constraints'
import { isConstraintApplicable } from './getDefaultDuration'
import { toWeekday } from '../../../util/time/weekdays'

export const getAllowedTags = ({ time, assigneeId, calendarId }) => {
  const constraint = Constraints.findOne({
    calendarId,
    assigneeIds: assigneeId,
    weekdays: toWeekday(time)
  })

  return constraint && isConstraintApplicable({ constraint, date: moment(time) }) && constraint.tags
}
