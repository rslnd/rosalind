import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Loading } from 'client/ui/components/Loading'
import { MainLayout } from './MainLayout'

const composer = (props, onData) => {
  // HACK: Expose history push method globally for legacy coffeescript stuff
  window.__deprecated_history_push = (l) => props.history.push(l)
  window.__deprecated_history_replace = (l) => props.history.replace(l)
  window.__deprecated_history_go_back = () => props.history.goBack()

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
  Meteor.subscribe('schedules-constraints')
  Meteor.subscribe('settings')

  const sidebarOpen = !props.location.pathname || !props.location.pathname.match(/appointments/)

  onData(null, { ...props, currentUser, locale, loggingIn, sidebarOpen })
}

const MainLayoutContainer = withRouter(composeWithTracker(composer, Loading)(MainLayout))

export { MainLayoutContainer }
