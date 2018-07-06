import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { Loading } from '../components/Loading'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props, onData) => {
  // HACK: Expose history push method globally for legacy coffeescript stuff
  window.__deprecated_history_push = (l) => props.history.push(l)
  window.__deprecated_history_replace = (l) => props.history.replace(l)
  window.__deprecated_history_go_back = () => props.history.goBack()

  const currentUser = Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = TAPi18n.getLanguage()
  // Track reactive role changes
  Roles.getRolesForUser(currentUser)

  if (currentUser) {
    subscribe('cache')
    subscribe('timesheets')
    subscribe('inboundCalls')
  }

  const loading = [
    subscribe('roles'),
    subscribe('users'),
    subscribe('groups'),
    subscribe('tags'),
    subscribe('calendars')
  ].some(s => !s.ready())

  // Try to subscribe to appointments and schedules for caching
  // The server will check for currentUser or a connection from
  // a trusted network
  subscribe('appointments-today')
  subscribe('appointments-future')
  subscribe('schedules')
  subscribe('schedules-constraints')
  subscribe('schedules-holidays')
  subscribe('settings')
  subscribe('inboundCalls-counts')

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments\//)

  const isPrint = props.location.hash === '#print'

  onData(null, { ...props, loading, currentUser, locale, loggingIn, sidebarOpen, isPrint })
}

const MainLayoutContainer = withRouter(composeWithTracker(composer, Loading)(MainLayout))

export { MainLayoutContainer }
