{ Meteor } = require 'meteor/meteor'
{ Tracker } = require 'meteor/tracker'
{ ReactiveDict } = require 'meteor/reactive-dict'
{ Schedules } = require 'api/schedules'
{ Users } = require 'api/users'

Template.schedulesDefault.currentView = new ReactiveDict


Template.schedulesDefault.onCreated ->
  Template.schedulesDefault.currentView.clear()
  Tracker.autorun ->
    Template.schedulesDefault.currentView.get('refresh')

    dirtyHack = window.location.pathname.split('/')

    if username = dirtyHack[dirtyHack.length - 1]
      user = Users.methods.findOneByIdOrUsername(username)

    user ||= Meteor.user()
    Template.schedulesDefault.currentView.set('userId', user._id)

Template.schedulesDefault.events
  'click [rel="edit"]': ->
    user = Users.findOne(_id: Template.schedulesDefault.currentView.get('userId'))

    Modal.show 'scheduleEdit',
      type: 'update'
      collection: Schedules
      doc: Schedules.findOne(userId: user._id, type: 'default')
      viewUser: user


Template.schedulesDefault.helpers
  schedulesDefault: ->
    Users.find({})

  viewUser: ->
    Users.findOne(_id: Template.schedulesDefault.currentView.get('userId'))

  totalHoursPerWeek: ->
    _.chain(Schedules.find({}).fetch())
      .map (s) -> Math.floor(s.totalHoursPerWeek())
      .reduce ((h, memo) -> memo + h), 0
      .value()
