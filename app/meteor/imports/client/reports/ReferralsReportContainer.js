import idx from 'idx'
import { compose } from 'recompose'
import fromPairs from 'lodash/fromPairs'
import {
  parse as fromQuery,
  stringify as toQuery
} from 'query-string'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { withTracker } from '../components/withTracker'
import { Users } from '../../api/users'
import { Referrals } from '../../api/referrals'
import { ReferralsReportScreen } from './ReferralsReportScreen'
import { withPromise } from '../components/withPromise'

const composer = props => {
  const username = idx(props, _ => _.match.params.username)
  const user = username && Users.findOne({ username }, { removed: true })

  const search = fromQuery(props.location.search)
  const from = (search.from && moment(search.from)) || moment().startOf('month')
  const to = (search.to && moment(search.to)) || moment().endOf('day')

  const isPrint = props.location.hash === '#print'

  const handleRangeChange = ({ start, end }) => {
    const search = toQuery({
      from: start.format('YYYY-MM-DD'),
      to: end.format('YYYY-MM-DD')
    })

    const path = `/reports/referrals/${username}?${search}`
    props.history.replace(path)
  }

  const handleChangeAssignee = (assigneeId) => {
    const user = Users.findOne({ _id: assigneeId }, { removed: true })
    const path = `/reports/referrals/${user ? user.username : ''}${props.location.search}`
    props.history.replace(path)
  }

  const userIdToNameMapping = fromPairs(Users.find({}).fetch().map(u => [u._id, Users.methods.fullNameWithTitle(u)]))
  const mapUserIdToName = id => userIdToNameMapping[id]

  return {
    user,
    from,
    to,
    isPrint,
    handleRangeChange,
    handleChangeAssignee,
    mapUserIdToName
  }
}

const fetchReferrals = ({ from, to, user }) => {
  if (user) {
    return Referrals.actions.detail.callPromise({
      from: from.toDate(),
      to: to.toDate(),
      referredBy: user._id,
      redeemImmediately: false
    })
  } else {
    return Promise.resolve()
  }
}

export const ReferralsReportContainer = compose(
  withRouter,
  withTracker(composer),
  withPromise(fetchReferrals)
)(ReferralsReportScreen)
