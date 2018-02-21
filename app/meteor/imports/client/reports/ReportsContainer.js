import idx from 'idx'
import { toClass } from 'recompose'
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
import { Tags } from '../../api/tags'
import { Calendars } from '../../api/calendars'
import { Loading } from '../components/Loading'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const dateParam = idx(props, _ => _.match.params.date)
    const date = moment(dateParam)
    const day = omit(dateToDay(date), 'date')

    const fetchedReports = Reports
      .find({ day })
      .fetch()
      .map(r => ({ ...r, calendar: Calendars.findOne({ _id: r.calendarId }) }))

    const reports = sortBy(r => r && r.calendar && r.calendar.order)(fetchedReports)

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

    const userIdToNameMapping = fromPairs(Users.find({}).fetch().map(u => [u._id, Users.methods.fullNameWithTitle(u)]))
    const mapUserIdToName = id => userIdToNameMapping[id]

    const userIdToUsernameMapping = fromPairs(Users.find({}).fetch().map(u => [u._id, u.username]))
    const mapUserIdToUsername = id => userIdToUsernameMapping[id]

    const mapReportAsToHeader = reportAs => {
      const tag = Tags.findOne({ reportAs })
      return (tag && tag.reportHeader) || reportAs
    }

    const __ = (key, opts) => TAPi18n.__(key, opts)

    const data = {
      date,
      reports,
      generateReport,
      sendEmail,
      sendEmailTest,
      viewAppointments,
      canShowRevenue,
      mapUserIdToName,
      mapUserIdToUsername,
      mapReportAsToHeader,
      __
    }

    onData(null, data)

    const mapPreview = (preview) => ({
      ...preview,
      today: moment().isSame(dayToDate(preview.day), 'day')
    })

    // Load quarter data in background
    Reports.actions.generateQuarter.callPromise({ day })
      .then(quarter => {
        onData(null, { ...data, quarter })

        // Then load preview data in background. Ugh.
        // TODO: Refactor.
        Reports.actions.generatePreview.callPromise({ day })
          .then(previews => previews.map(p => ({
            calendarId: p.calendarId,
            calendar: Calendars.findOne({ _id: p.calendarId }),
            days: p.days.map(mapPreview)
          })))
          .then(previews => onData(null, { ...data, quarter, previews }))
      })
  }
}

export const ReportsContainer = withRouter(toClass(composeWithTracker(composer, Loading)(ReportsScreen)))
