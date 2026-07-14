import idx from 'idx'
import fromPairs from 'lodash/fromPairs'
import { parse as fromQuery } from 'query-string'
import { compose, mapProps, toClass } from 'recompose'
import moment from 'moment-timezone'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { withTracker } from '../components/withTracker'
import { Reports } from '../../api/reports'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { dayToDate } from '../../util/time/day'
import { ReportsScreen } from './ReportsScreen'
import { withPromise } from '../components/withPromise'

// Only stable primitives/plain objects reach withPromise, so fetches re-run on
// date change only (deep-equal props do not refetch; functions are ignored).
const toProps = (props) => {
  const dateParam = idx(props, _ => _.match.params.date)
  const slug = dateParam || moment().format('YYYY-MM-DD')
  const date = moment(slug).endOf('day')
  const day = { year: date.year(), month: date.month() + 1, day: date.date() }
  const isPrint = props.location.hash === '#print'
  // Forwarded to the report methods so the headless PDF/e-mail render (which
  // loads this page with ?accessToken=…) is authorized server-side.
  const accessToken = fromQuery(props.location.search).accessToken

  return { ...props, slug, day, isPrint, accessToken }
}

const namesComposer = (props) => {
  const users = Users.find({}).fetch()
  const nameById = fromPairs(users.map(u => [u._id, Users.methods.fullNameWithTitle(u)]))
  const usernameById = fromPairs(users.map(u => [u._id, u.username]))

  return {
    ...props,
    mapUserIdToName: id => nameById[id],
    mapUserIdToUsername: id => usernameById[id]
  }
}

const fetchStatistics = ({ slug, accessToken }) =>
  Reports.actions.statistics
    .callPromise({ asOf: moment(slug).endOf('day').toDate(), ...(accessToken ? { accessToken } : {}) })
    .then(statistics => ({ statistics }))

const mapPreview = (preview) => ({
  ...preview,
  today: moment().isSame(dayToDate(preview.day), 'day')
})

const fetchPreview = ({ day, accessToken }) =>
  Reports.actions.generatePreview.callPromise({ day, ...(accessToken ? { accessToken } : {}) })
    .then(previews => previews.map(p => ({
      calendarId: p.calendarId,
      calendar: Calendars.findOne({ _id: p.calendarId }),
      days: p.days.map(mapPreview)
    })))
    .then(previews => ({ previews }))
    .catch(() => ({ previews: null }))

const withActions = (props) => {
  const { slug, day } = props

  return {
    ...props,
    date: moment(slug).endOf('day'),
    viewAppointments () {
      props.history.push(`/appointments/${slug}`)
    },
    sendEmail () {
      Meteor.call('reports/sendEmail', { day })
    },
    sendEmailTest () {
      Meteor.call('reports/sendEmail', { to: 'me+TEST@albertzak.com', day })
    }
  }
}

const maybePrint = (props) => {
  // previews is undefined while pending, and null/value once settled (its fetch
  // catches errors) — so a failing preview never blocks PDF generation.
  if (props.isPrint && props.statistics && props.previews !== undefined) {
    console.log('[ReportsContainer] Statistics + preview settled, printing')
    window.print()
  }
  return props
}

export const ReportsContainer = compose(
  withRouter,
  mapProps(toProps),
  withTracker(namesComposer),
  withPromise(fetchStatistics),
  withPromise(fetchPreview),
  mapProps(withActions),
  mapProps(maybePrint),
  toClass
)(ReportsScreen)
