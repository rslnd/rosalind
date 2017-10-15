import idx from 'idx'
import omit from 'lodash/omit'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/fp/sortBy'
import moment from 'moment-timezone'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { dateToDay, dayToDate } from '../../util/time/day'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Loading } from '../components/Loading'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const dateParam = idx(props, _ => _.match.params.date)
    const date = moment(dateParam)
    const day = omit(dateToDay(date), 'date')
    const report = Reports.findOne({ day })

    const isPrint = props.location.hash === '#print'
    const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ]) || isPrint

    const generateReport = () => {
      return Reports.actions.generate.callPromise({ day })
    }

    const viewAppointments = () => {
      props.history.push(`/appointments/${dateParam}`)
    }

    const sendEmailTest = () => {
      Meteor.call('reports/sendEmail', { to: 'me+TEST@albertzak.com', day })
    }

    const sendEmail = () => {
      Meteor.call('reports/sendEmail')
    }

    const userIdToNameMapping = fromPairs(Meteor.users.find({}).fetch().map(u => [u._id, u.fullNameWithTitle()]))
    const mapUserIdToName = id => userIdToNameMapping[id]

    const userIdToUsernameMapping = fromPairs(Meteor.users.find({}).fetch().map(u => [u._id, u.username]))
    const mapUserIdToUsername = id => userIdToUsernameMapping[id]

    const __ = (key, opts) => TAPi18n.__(key, opts)

    const data = {
      date,
      report,
      generateReport,
      sendEmail,
      sendEmailTest,
      viewAppointments,
      canShowRevenue,
      mapUserIdToName,
      mapUserIdToUsername,
      __
    }

    onData(null, data)

    const mapPreview = (preview) => ({
      ...preview,
      today: moment().isSame(dayToDate(preview.day), 'day')
    })

    // Load preview data in background
    Reports.actions.generatePreview.callPromise({ day })
      .then(x => x.map(mapPreview))
      .then(preview => onData(null, { ...data, preview }))
  }
}

export const ReportsContainer = withRouter(composeWithTracker(composer, Loading)(ReportsScreen))
