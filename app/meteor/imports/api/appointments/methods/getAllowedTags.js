import moment from 'moment-timezone'
import { Schedules } from '../../schedules'
import { isConstraintApplicable } from './getDefaultDuration'

export const getAllowedTags = ({ time, assigneeId, calendarId }) => {
  const date = moment(time)

  const constraint = Schedules.findOne({
    type: 'constraint',
    calendarId,
    userId: assigneeId,
    weekdays: date.clone().locale('en').format('ddd').toLowerCase(),
    start: { $lte: date.toDate() },
    end: { $gte: date.toDate() }
  })

  return constraint && isConstraintApplicable({ constraint, date }) && constraint.tags
}
