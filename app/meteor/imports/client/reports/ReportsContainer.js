import idx from 'idx'
import { compose, mapProps, toClass } from 'recompose'
import omit from 'lodash/omit'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/fp/sortBy'
import moment from 'moment-timezone'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { dateToDay, dayToDate } from '../../util/time/day'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Tags } from '../../api/tags'
import { Calendars } from '../../api/calendars'
import { Referrals } from '../../api/referrals'
import { ReportsScreen } from './ReportsScreen'
import { withPromise } from '../components/withPromise'
import { subscribe } from '../../util/meteor/subscribe'

const composer = props => {
  const dateParam = idx(props, _ => _.match.params.date)
  const date = moment(dateParam).startOf('day')
  const day = omit(dateToDay(date), 'date')

  const subscription = subscribe('reports', { date: date.toDate() })
  const dayReports = Reports
    .find({
      'day.day': day.day,
      'day.month': day.month,
      'day.year': day.year
    }).fetch()

  const reportLoading = (!subscription.ready() && dayReports.length === 0)

  const reportsWithCalendar = dayReports
    .map(r => ({ ...r, calendar: Calendars.findOne({ _id: r.calendarId }) }))
  const reports = sortBy(r => r && r.calendar && r.calendar.order)(reportsWithCalendar)

  const isPrint = props.location.hash === '#print'
  const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ]) || isPrint

  const userIdToNameMapping = fromPairs(Users.find({}).fetch().map(u => [u._id, Users.methods.fullNameWithTitle(u)]))
  const mapUserIdToName = id => userIdToNameMapping[id]

  const userIdToUsernameMapping = fromPairs(Users.find({}).fetch().map(u => [u._id, u.username]))
  const mapUserIdToUsername = id => userIdToUsernameMapping[id]

  const mapReportAsToHeader = reportAs => {
    const tag = Tags.findOne({ reportAs })
    return (tag && tag.reportHeader) || reportAs
  }

  const viewAppointments = () => {
    props.history.push(`/appointments/${dateParam}`)
  }

  const generateReport = () => {
    if (window.native && window.native.emit) {
      window.native.emit('automation/generateEoswinReports', { day })
    }

    return Reports.actions.generate.callPromise({ day })
  }

  const sendEmailTest = () => {
    Meteor.call('reports/sendEmail', { to: 'me+TEST@albertzak.com', day })
  }

  const sendEmail = () => {
    Meteor.call('reports/sendEmail')
  }

  return {
    isPrint,
    reportLoading,
    day,
    date,
    reports,
    generateReport,
    sendEmail,
    sendEmailTest,
    viewAppointments,
    canShowRevenue,
    mapUserIdToName,
    mapUserIdToUsername,
    mapReportAsToHeader
  }
}

const mapPreview = (preview) => ({
  ...preview,
  today: moment().isSame(dayToDate(preview.day), 'day')
})

const fetchPreview = ({ day }) =>
  Reports.actions.generatePreview.callPromise({ day })
    .then(previews => previews.map(p => ({
      calendarId: p.calendarId,
      calendar: Calendars.findOne({ _id: p.calendarId }),
      days: p.days.map(mapPreview)
    })))
    .then(previews => ({ previews }))

const fetchQuarter = ({ day }) =>
  Reports.actions.generateQuarter.callPromise({ day })
    .then(quarter => ({ quarter }))

const fetchReferrals = ({ date }) =>
  Referrals.actions.tally.callPromise({ date: date.toDate() })
    .then(referrals => ({ referrals }))

export const ReportsContainer = compose(
  withRouter,
  withTracker(composer),
  withPromise(fetchQuarter),
  withPromise(fetchPreview),
  withPromise(fetchReferrals),
  mapProps(p => {
    if (p.isPrint && p.quarter && p.referrals && p.previews) {
      console.log('[ReportsContainer] All loaded, now printing')
      window.print()
    }

    return p
  }),
  toClass
)(ReportsScreen)
