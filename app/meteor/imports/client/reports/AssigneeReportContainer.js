import idx from 'idx'
import { parse } from 'query-string'
import omit from 'lodash/omit'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/fp/sortBy'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { getAssignee } from '../../api/reports/methods/getAssignee'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Loading } from '../components/Loading'
import { AssigneeReportScreen } from './AssigneeReportScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const username = idx(props, _ => _.match.params.username)
    const user = Users.findOne({ username })
    const assigneeId = user && user._id

    const reports = Reports.find({}).fetch()

    const search = parse(props.location.search)
    const from = search.from && moment(search.from) || moment().startOf('month')
    const to = search.to && moment(search.to) || moment()

    const report = getAssignee({ reports, assigneeId, from, to })

    const isPrint = props.location.hash === '#print'
    const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ]) || isPrint

    const __ = (key, opts) => TAPi18n.__(key, opts)

    const data = {
      canShowRevenue,
      isPrint,
      report,
      user,
      from,
      to,
      __
    }

    onData(null, data)
  }
}

export const AssigneeReportContainer = withRouter(composeWithTracker(composer, Loading)(AssigneeReportScreen))
