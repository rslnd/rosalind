import { compose, withState } from 'recompose'
import every from 'lodash/fp/every'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'
import { Settings } from '../../api/settings'
import { getClientKey } from '../../startup/client/native/events'

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

  const metaTag = document.head.querySelector('[property=theme-color][content]')
  const primaryColor = Settings.get('primaryColor') || (metaTag && metaTag.content.match(/^#[a-fA-F0-9]{1,8}$/ && metaTag.content))

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
    primaryColor,
    isNative: (
      !!getClientKey() ||
      navigator.userAgent.toLocaleLowerCase().indexOf('rosalind') !== -1 ||
      navigator.userAgent.toLocaleLowerCase().indexOf('electron') !== -1
    )
  }
}

const MainLayoutContainer = compose(
  withState('isForcedLogout', 'setIsForcedLogout', false),
  withRouter,
  withTracker(composer)
)(MainLayout)

export { MainLayoutContainer }
