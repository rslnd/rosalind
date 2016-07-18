import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { MainLayout } from './MainLayout'

const composer = (props, onData) => {
  const currentUser = Meteor.user()
  const locale = TAPi18n.getLanguage()

  if (currentUser) {
    let handles = []

    handles.push(Meteor.subscribe('users'))
    handles.push(Meteor.subscribe('cache'))
    handles.push(Meteor.subscribe('groups'))
    handles.push(Meteor.subscribe('tags'))
    handles.push(Meteor.subscribe('schedules'))
    handles.push(Meteor.subscribe('timesheets'))
    handles.push(Meteor.subscribe('inboundCalls'))

    if (handles.every((h) => h.ready())) {
      onData(null, { ...props, currentUser, locale })
    }
  } else {
    const loggingIn = Meteor.loggingIn()
    onData(null, { ...props, currentUser, locale, loggingIn })
  }
}

const MainLayoutContainer = composeWithTracker(composer)(MainLayout)

export { MainLayoutContainer }
