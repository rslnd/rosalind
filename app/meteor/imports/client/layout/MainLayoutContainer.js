import { compose, withState } from 'recompose'
import { withTracker } from '../components/withTracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { MainLayout } from './MainLayout'
import { subscribe } from '../../util/meteor/subscribe'
import { Settings } from '../../api/settings'
import { getClientKey } from '../../startup/client/native/events'

// is valid hex color? to avoid weird grey flicker after logout
const isColor = s => s && s.match && s.match(/^#[a-fA-F0-9]{1,8}$/)

const composer = (props) => {
  // UI performance hack because logging out takes a long time
  const handleLogout = () => props.setIsForcedLogout(true)
  const handleLoginSuccess = () => props.setIsForcedLogout(false)
  const currentUser = props.isForcedLogout ? null : Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = 'de-AT'

  const subs = [
    subscribe('settings'),
    subscribe('users'),
    subscribe('groups'),
    subscribe('tags'),
    subscribe('calendars')
  ]

  if (Meteor.user()) {
    subs.push(subscribe('timesheets'))
    subs.push(subscribe('inboundCalls'))
    subs.push(subscribe('appointments-today'))
    subs.push(subscribe('availabilities'))
    subs.push(subscribe('constraints'))
    subs.push(subscribe('schedules-holidays'))
    subs.push(subscribe('inboundCalls-counts'))
    subs.push(subscribe('inboundCallsTopics'))
    subs.push(subscribe('referrables'))
    subs.push(subscribe('media-tags'))
    subs.push(subscribe('templates'))
  }

  const isReadyToPrint = subs.every(s => s.ready())

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments\//)

  const isPrint = props.location.hash === '#print'

  if (isPrint && !isReadyToPrint) {
    return { isLoading: true }
  }

  const themeColorMetaTag = document.head.querySelector('[property=theme-color][content]')
  const primaryColor =
    (isColor(Settings.get('primaryColor')) && Settings.get('primaryColor')) ||
    (isColor(themeColorMetaTag.content) && themeColorMetaTag.content) ||
    '#3c8dbc'


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
