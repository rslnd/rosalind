import idx from 'idx'
import { compose, toClass } from 'recompose'
import omit from 'lodash/omit'
import fromPairs from 'lodash/fromPairs'
import sortBy from 'lodash/fp/sortBy'
import moment from 'moment-timezone'
import { withTracker } from 'meteor/react-meteor-data'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { dateToDay, dayToDate } from '../../util/time/day'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Tags } from '../../api/tags'
import { Calendars } from '../../api/calendars'
import { ReportsScreen } from './ReportsScreen'
import { withMethodData } from '../components/withMethodData'

const composer = props => {
  const dateParam = idx(props, _ => _.match.params.date)
  const date = moment(dateParam)
  const day = omit(dateToDay(date), 'date')

  if (Meteor.subscribe('reports').ready()) {
    const fetchedReports = Reports
      .find({ day })
      .fetch()
      .map(r => ({ ...r, calendar: Calendars.findOne({ _id: r.calendarId }) }))

    const reports = sortBy(r => r && r.calendar && r.calendar.order)(fetchedReports)

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
      return Reports.actions.generate.callPromise({ day })
    }

    const sendEmailTest = () => {
      Meteor.call('reports/sendEmail', { to: 'me+TEST@albertzak.com', day })
    }

    const sendEmail = () => {
      Meteor.call('reports/sendEmail')
    }

    return {
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
  } else {
    return {
      day,
      date,
      loading: true
    }
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

export const ReportsContainer = compose(
  withRouter,
  withTracker(composer),
  withMethodData(fetchPreview),
  withMethodData(fetchQuarter),
  toClass
)(ReportsScreen)
