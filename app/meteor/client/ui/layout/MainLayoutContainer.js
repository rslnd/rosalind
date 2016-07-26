import { composeWithTracker } from 'react-komposer'
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
    Meteor.subscribe('schedules')
    Meteor.subscribe('timesheets')
    Meteor.subscribe('inboundCalls')
  }

  onData(null, { ...props, currentUser, locale, loggingIn })
}

const MainLayoutContainer = composeWithTracker(composer, Loading)(MainLayout)

export { MainLayoutContainer }
