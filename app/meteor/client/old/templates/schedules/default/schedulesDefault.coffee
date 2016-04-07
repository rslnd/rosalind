{ Meteor } = require 'meteor/meteor'
{ Tracker } = require 'meteor/tracker'
{ ReactiveDict } = require 'meteor/reactive-dict'
{ Schedules } = require '/imports/api/schedules'
{ Users } = require '/imports/api/users'

Template.schedulesDefault.currentView = new ReactiveDict

Template.schedulesDefault.watchPathChange = ->
  @currentView.clear()
  Tracker.autorun =>
    FlowRouter.watchPathChange()
    if username = FlowRouter.current()?.params?.username
      user = Users.methods.findOneByIdOrUsername(username)
    else
      user = Meteor.user()
    @currentView.set('userId', user._id)

Template.schedulesDefault.onCreated ->
  Template.schedulesDefault.watchPathChange()

Template.schedulesDefault.events
  'click [rel="edit"]': ->
    user = Users.findOne(_id: Template.schedulesDefault.currentView.get('userId'))

    Modal.show 'scheduleEdit',
      type: 'update'
      collection: Schedules
      doc: user.defaultSchedule()
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
