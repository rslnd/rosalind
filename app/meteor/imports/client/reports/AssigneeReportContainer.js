import idx from 'idx'
import { compose } from 'recompose'
import fromPairs from 'lodash/fromPairs'
import {
  parse as fromQuery,
  stringify as toQuery
} from 'query-string'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { withTracker } from '../components/withTracker'
import { getAssignee } from '../../api/reports/methods/getAssignee'
import { Calendars } from '../../api/calendars'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Tags } from '../../api/tags'
import { Referrals } from '../../api/referrals'
import { AssigneeReportScreen } from './AssigneeReportScreen'
import { withPromise } from '../components/withPromise'
import { subscribe } from '../../util/meteor/subscribe'
import { hasRole } from '../../util/meteor/hasRole'

const composer = props => {
  const username = idx(props, _ => _.match.params.username)
  const user = username && Users.findOne({ username }, { removed: true })
  const assigneeId = user && user._id

  const search = fromQuery(props.location.search)
  const from = (search.from && moment(search.from)) || moment().startOf('month')
  const to = (search.to && moment(search.to)) || moment().endOf('day')

  const subscription = subscribe('reports', {
    from: from.toDate(),
    to: to.toDate()
  })

  const reports = Calendars
    .find({}, { sort: { order: 1 } })
    .fetch().map(calendar => {
      const calendarId = calendar._id

      const assigneeReports = Reports.find({
        calendarId,
        'day.date': {
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
  const canShowRevenue = hasRole(Meteor.userId(), ['reports-showRevenue', 'admin']) || isPrint

  const handleRangeChange = ({ start, end }) => {
    const search = toQuery({
      from: start.format('YYYY-MM-DD'),
      to: end.format('YYYY-MM-DD')
    })

    const path = `/reports/assignee/${username}?${search}`
    props.history.replace(path)
  }

  const handleChangeAssignee = (assigneeId) => {
    const user = Users.findOne({ _id: assigneeId }, { removed: true })
    const path = `/reports/assignee/${user ? user.username : ''}${props.location.search}`
    props.history.replace(path)
  }

  const mapReportAsToHeader = reportAs => {
    const tag = Tags.findOne({ reportAs })
    return (tag && tag.reportHeader) || reportAs
  }

  const userIdToNameMapping = fromPairs(Users.find({}).fetch().map(u => [u._id, Users.methods.fullNameWithTitle(u)]))
  const mapUserIdToName = id => userIdToNameMapping[id]

  return {
    loading,
    user,
    from,
    to,
    canShowRevenue,
    isPrint,
    reports,
    handleRangeChange,
    handleChangeAssignee,
    mapReportAsToHeader,
    mapUserIdToName
  }
}

const fetchReferrals = ({ from, to, user }) => {
  if (user) {
    return Referrals.actions.tally.callPromise({
      date: new Date(),
      from: from.toDate(),
      to: to.toDate(),
      referredBy: user._id,
      redeemImmediately: false
    }).then(referrals => ({ referrals }))
  } else {
    return Promise.resolve()
  }
}

export const AssigneeReportContainer = compose(
  withRouter,
  withTracker(composer),
  withPromise(fetchReferrals)
)(AssigneeReportScreen)
