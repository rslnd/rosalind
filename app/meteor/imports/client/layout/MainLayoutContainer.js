import { compose, withState } from 'recompose'
import every from 'lodash/fp/every'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'
import { Settings } from '../../api/settings'

const composer = (props) => {
  // UI performance hack because logging out takes a long time
  const handleLogout = () => props.setIsForcedLogout(true)
  const handleLoginSuccess = () => props.setIsForcedLogout(false)
  const currentUser = props.isForcedLogout ? null : Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = 'de-AT'

  subscribe('settings')

  if (Meteor.user()) {
    subscribe('timesheets')
    subscribe('inboundCalls')
    subscribe('appointments-today')
    subscribe('availabilities')
    subscribe('constraints')
    subscribe('schedules-holidays')
    subscribe('inboundCalls-counts')
    subscribe('inboundCallsTopics')
    subscribe('referrables')
    subscribe('media-tags')
    subscribe('templates')
  }

  const isReadyToPrint = every(s => s.ready())([
    subscribe('users'),
    subscribe('groups'),
    subscribe('tags'),
    subscribe('calendars')
  ])

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments\//)

  const primaryColor = Settings.get('primaryColor')

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
    isPrint,
    primaryColor
  }
}

const MainLayoutContainer = compose(
  withState('isForcedLogout', 'setIsForcedLogout', false),
  withRouter,
  withTracker(composer)
)(MainLayout)

export { MainLayoutContainer }
