import { compose, withState } from 'recompose'
import every from 'lodash/fp/every'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  // UI performance hack because logging out takes a long time
  const handleLogout = () => props.setIsForcedLogout(true)
  const handleLoginSuccess = () => props.setIsForcedLogout(false)
  const currentUser = props.isForcedLogout ? null : Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = 'de-AT'
  // Track reactive role changes
  Roles.getRolesForUser(currentUser)

  let isReadyToPrint = true // Needed for printing only
  if (currentUser) {
    isReadyToPrint = every(s => s.ready())([
      subscribe('timesheets'),
      subscribe('inboundCalls'),
      subscribe('appointments-today'),
      subscribe('availabilities'),
      subscribe('constraints'),
      subscribe('schedules-holidays'),
      subscribe('settings'),
      subscribe('inboundCalls-counts'),
      subscribe('inboundCallsTopics'),
      subscribe('roles'),
      subscribe('users'),
      subscribe('groups'),
      subscribe('tags'),
      subscribe('calendars')
    ])
  }

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments\//)

  const isPrint = props.location.hash === '#print'

  if (isPrint && !isReadyToPrint) {
    return { isLoading: true }
  }

  return {
    ...props,
    currentUser,
    locale,
    loggingIn,
    handleLoginSuccess,
    handleLogout,
    sidebarOpen,
    isPrint
  }
}

const MainLayoutContainer = compose(
  withState('isForcedLogout', 'setIsForcedLogout', false),
  withRouter,
  withTracker(composer)
)(MainLayout)

export { MainLayoutContainer }
