import { composeWithTracker } from 'react-komposer'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Loading } from 'client/ui/components/Loading'
import { MainLayout } from './MainLayout'

const composer = (props, onData) => {
  const currentUser = Meteor.user()
  const loggingIn = Meteor.loggingIn()
  const locale = TAPi18n.getLanguage()

  if (currentUser) {
    Meteor.subscribe('users')
    Meteor.subscribe('cache')
    Meteor.subscribe('groups')
    Meteor.subscribe('tags')
    Meteor.subscribe('timesheets')
    Meteor.subscribe('inboundCalls')
  }

  // Try to subscribe to appointments and schedules for caching
  // The server will check for currentUser or a connection from
  // a trusted network
  Meteor.subscribe('appointments')
  Meteor.subscribe('schedules')

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments/)

  onData(null, { ...props, currentUser, locale, loggingIn, sidebarOpen })
}

const MainLayoutContainer = withRouter(composeWithTracker(composer, Loading)(MainLayout))

export { MainLayoutContainer }
