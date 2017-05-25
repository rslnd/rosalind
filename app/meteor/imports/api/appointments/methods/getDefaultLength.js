import max from 'lodash/max'
import { Users } from '../../users'
import { Schedules } from '../../schedules'
import { Tags } from '../../tags'

const defaultLength = 5

const getLengthConstraint = ({ assigneeId, date }) => {
  if (!date || !assigneeId) {
    return defaultLength
  }

  const constraint = Schedules.findOne({
    type: 'constraint',
    userId: assigneeId,
    weekdays: date.clone().locale('en').format('ddd').toLowerCase(),
    start: { $lte: date.toDate() },
    end: { $gte: date.toDate() }
  })

  return constraint && constraint.length || defaultLength
}

export const getDefaultLength = ({ assigneeId, date, tags }) => {
  let assigneeLength
  let tagLengths = []

  if (assigneeId) {
    const user = Users.findOne({ _id: assigneeId })
    if (user && user.settings && user.settings.appointments && user.settings.appointments.defaultLength) {
      assigneeLength = user.settings.appointments.defaultLength
    }
  }

  if (tags) {
    tagLengths = Tags.find({ _id: { $in: tags } }).fetch().map(t => t.length)
  }

  const maxLength = max([ assigneeLength, ...tagLengths, getLengthConstraint({ assigneeId, date }) ])

  return maxLength || defaultLength
}
