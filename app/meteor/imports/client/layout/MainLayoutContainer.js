import every from 'lodash/fp/every'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  const currentUser = Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = 'de-AT'
  // Track reactive role changes
  Roles.getRolesForUser(currentUser)

  if (currentUser) {
    subscribe('timesheets')
    subscribe('inboundCalls')
  }

  const isReady = every(s => s.ready())([
    subscribe('roles'),
    subscribe('users'),
    subscribe('groups'),
    subscribe('tags'),
    subscribe('calendars')
  ])

  // Try to subscribe to appointments and schedules for caching
  // The server will check for currentUser or a connection from
  // a trusted network
  subscribe('appointments-today')
  subscribe('availabilities')
  subscribe('constraints')
  subscribe('schedules-holidays')
  subscribe('settings')
  subscribe('inboundCalls-counts')
  subscribe('inboundCallsTopics')

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments\//)

  const isPrint = props.location.hash === '#print'

  if (isPrint && !isReady) {
    return { isLoading: true }
  }

  return { ...props, currentUser, locale, loggingIn, sidebarOpen, isPrint }
}

const MainLayoutContainer = withRouter(withTracker(composer)(MainLayout))

export { MainLayoutContainer }
