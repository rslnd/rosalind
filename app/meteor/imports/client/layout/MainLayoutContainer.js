import { withTracker } from 'meteor/react-meteor-data'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  // HACK: Expose history push method globally for legacy coffeescript stuff
  window.__deprecated_history_push = (l) => props.history.push(l)
  window.__deprecated_history_replace = (l) => props.history.replace(l)
  window.__deprecated_history_go_back = () => props.history.goBack()

  const currentUser = Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = 'de-AT'
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

  return { ...props, loading, currentUser, locale, loggingIn, sidebarOpen, isPrint }
}

const MainLayoutContainer = withRouter(withTracker(composer)(MainLayout))

export { MainLayoutContainer }
