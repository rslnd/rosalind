import sortBy from 'lodash/fp/sortBy'
import _moment from 'moment'
import { extendMoment } from 'moment-range'
import { dayToDate } from '../../../util/time/day'

const moment = extendMoment(_moment)

const isWithin = ({ from, to }) => report =>
  moment.range(from, to).contains(dayToDate(report.day))

const includesAssignee = assigneeId => report =>
  report.assignees.some(a => a.assigneeId === assigneeId)

const findAssignee = assigneeId => report => ({
  ...report.assignees.find(a => a.assigneeId === assigneeId),
  day: report.day
})

export const getAssignee = ({ assigneeId, reports = [], from, to }) => {
  const assignees = sortBy(r => dayToDate(r.day))(reports
    .filter(isWithin({ from, to }))
    .filter(includesAssignee(assigneeId))
    .map(findAssignee(assigneeId)))

  return {
    assignees
  }
}
