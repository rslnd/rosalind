import idx from 'idx'
import { parse } from 'query-string'
import omit from 'lodash/omit'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/fp/sortBy'
import moment from 'moment-timezone'
import { stringify as toQuery } from 'query-string'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { getAssignee } from '../../api/reports/methods/getAssignee'
import { Calendars } from '../../api/calendars'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Loading } from '../components/Loading'
import { AssigneeReportScreen } from './AssigneeReportScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const username = idx(props, _ => _.match.params.username)
    const user = Users.findOne({ username })
    const assigneeId = user && user._id

    const search = parse(props.location.search)
    const from = search.from && moment(search.from) || moment().startOf('month')
    const to = search.to && moment(search.to) || moment()

    const reports = Calendars
      .find({}, { sort: { order: 1 } })
      .fetch().map(calendar => {
        const calendarId = calendar._id

        const assigneeReports = Reports.find({ calendarId }).fetch()

        return {
          ...getAssignee({ reports: assigneeReports, assigneeId, from, to }),
          calendar
        }
      }).filter(r => r && r.assignees && r.assignees.length > 0)

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
      if (user) {
        const path = `/reports/assignee/${user.username}${props.location.search}`
        props.history.replace(path)
      }
    }

    const __ = (key, opts) => TAPi18n.__(key, opts)

    const data = {
      canShowRevenue,
      isPrint,
      reports,
      user,
      from,
      to,
      handleRangeChange,
      handleChangeAssignee,
      __
    }

    onData(null, data)
  }
}

export const AssigneeReportContainer = withRouter(composeWithTracker(composer, Loading)(AssigneeReportScreen))
