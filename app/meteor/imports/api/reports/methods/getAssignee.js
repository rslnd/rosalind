import sortBy from 'lodash/fp/sortBy'
import findIndex from 'lodash/fp/findIndex'
import _moment from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { mapTotal } from './mapTotal'
import { mapAverage } from './mapAverage'
import { dayToDate } from '../../../util/time/day'

const moment = extendMoment(_moment)

const isWithin = ({ from, to }) => report =>
  moment.range(from, to).contains(dayToDate(report.day))

const includesAssignee = assigneeId => report =>
  report.assignees.some(a => a.assigneeId === assigneeId)

const findAssignee = assigneeId => report => ({
  ...report.assignees.find(a => a.assigneeId === assigneeId),
  day: report.day,
  overbooking: report.assignees.find(a => a.type === 'overbooking'),
  rank: findIndex(a => a.assigneeId === assigneeId)(report.assignees) + 1,
  assignees: report.total.assignees
})

export const getAssignee = ({ assigneeId, reports = [], from, to }) => {
  let report = {}

  report.assignees = sortBy(r => dayToDate(r.day))(reports
    .filter(isWithin({ from, to }))
    .filter(includesAssignee(assigneeId))
    .map(findAssignee(assigneeId)))

  report.total = mapTotal({ report })
  report.average = mapAverage({ report })

  return report
}
