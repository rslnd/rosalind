import React from 'react'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { MainLayout } from './MainLayout'

const composer = (props, onData) => {
  let handles = []

  handles.push(Meteor.subscribe('users'))
  handles.push(Meteor.subscribe('cache'))
  handles.push(Meteor.subscribe('groups'))
  handles.push(Meteor.subscribe('tags'))
  handles.push(Meteor.subscribe('schedules'))
  handles.push(Meteor.subscribe('timesheets'))
  handles.push(Meteor.subscribe('inboundCalls'))

  if (handles.every((h) => h.ready())) {
    const currentUser = Meteor.user()
    onData(null, { currentUser, main: props.main })
  }
}

const MainLayoutContainer = composeWithTracker(composer)(MainLayout)

export { MainLayoutContainer }
