import omit from 'lodash/omit'
import fromPairs from 'lodash/fromPairs'
import moment from 'moment-timezone'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { dateToDay } from '../../util/time/day'
import { Reports } from '../../api/reports'
import { Loading } from '../components/Loading'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const dateParam = props.match && props.match.params && props.match.params.date
    const date = moment(dateParam)
    const day = omit(dateToDay(date), 'date')
    const report = Reports.findOne({ day })
    const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ])

    const generateReport = () => {
      return Reports.actions.generate.callPromise({ day })
    }

    const viewAppointments = () => {
      props.history.push(`/appointments/${dateParam}`)
    }

    const sendEmailTest = () => {
      Meteor.call('reports/sendEmail', { to: 'me+TEST@albertzak.com' })
    }

    const sendEmail = () => {
      Meteor.call('reports/sendEmail')
    }

    const userIdToNameMapping = fromPairs(Meteor.users.find({}).fetch().map(u => [u._id, u.fullNameWithTitle()]))
    const mapUserIdToName = id => userIdToNameMapping[id]

    const __ = (key, opts) => TAPi18n.__(key, opts)

    onData(null, {
      date,
      report,
      generateReport,
      sendEmail,
      sendEmailTest,
      viewAppointments,
      canShowRevenue,
      mapUserIdToName,
      __ })
  }
}

export const ReportsContainer = withRouter(composeWithTracker(composer, Loading)(ReportsScreen))
