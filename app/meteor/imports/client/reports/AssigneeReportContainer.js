import idx from 'idx'
import { toClass } from 'recompose'
import {
  parse as fromQuery,
  stringify as toQuery
} from 'query-string'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { withTracker } from 'meteor/react-meteor-data'
import { getAssignee } from '../../api/reports/methods/getAssignee'
import { Calendars } from '../../api/calendars'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { AssigneeReportScreen } from './AssigneeReportScreen'

const composer = props => {
  const username = idx(props, _ => _.match.params.username)
  const user = username && Users.findOne({ username })
  const assigneeId = user && user._id

  const search = fromQuery(props.location.search)
  const from = search.from && moment(search.from) || moment().startOf('month')
  const to = search.to && moment(search.to) || moment().endOf('day')

  const subscription = Meteor.subscribe('reports', {
    from: from.toDate(),
    to: to.toDate()
  })

  const reports = Calendars
    .find({}, { sort: { order: 1 } })
    .fetch().map(calendar => {
      const calendarId = calendar._id

      const assigneeReports = Reports.find({
        calendarId,
        createdAt: {
          $gte: from.toDate(),
          $lte: to.toDate()
        }
      }).fetch()

      return {
        ...getAssignee({ reports: assigneeReports, assigneeId, from, to }),
        calendar
      }
    }).filter(r => r && r.assignees && r.assignees.length > 0)

  const loading = !subscription.ready()
  const isPrint = props.location.hash === '#print'
  const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ]) || isPrint

  const handleRangeChange = ({ start, end }) => {
    const search = toQuery({
      from: start.format('YYYY-MM-DD'),
      to: end.format('YYYY-MM-DD')
    })

    const path = `/reports/assignee/${username}?${search}`
    props.history.replace(path)
  }

  const handleChangeAssignee = (assigneeId) => {
    const user = Users.findOne({ _id: assigneeId })
    const path = `/reports/assignee/${user ? user.username : ''}${props.location.search}`
    props.history.replace(path)
  }

  return {
    loading,
    user,
    from,
    to,
    canShowRevenue,
    isPrint,
    reports,
    handleRangeChange,
    handleChangeAssignee
  }
}

export const AssigneeReportContainer = withRouter(toClass(withTracker(composer)(AssigneeReportScreen)))
