Template.schedulesDefault.currentView = new ReactiveDict

Template.schedulesDefault.watchPathChange = ->
  @currentView.clear()
  Tracker.autorun =>
    FlowRouter.watchPathChange()
    if username = FlowRouter.current()?.params?.username
      user = Meteor.users.findOneByIdOrUsername(username)
    else
      user = Meteor.user()
    @currentView.set('userId', user._id)

Template.schedulesDefault.onCreated ->
  Template.schedulesDefault.watchPathChange()

Template.schedulesDefault.events
  'click [rel="edit"]': ->
    user = Meteor.users.findOne(_id: Template.schedulesDefault.currentView.get('userId'))

    Modal.show 'scheduleEdit',
      type: 'update'
      collection: Schedules
      doc: user.defaultSchedule()
      viewUser: user


Template.schedulesDefault.helpers
  schedulesDefault: ->
    Meteor.users.find({})

  viewUser: ->
    Meteor.users.findOne(_id: Template.schedulesDefault.currentView.get('userId'))

  totalHoursPerWeek: ->
    _.chain(Schedules.find({}).fetch())
      .map (s) -> Math.floor(s.totalHoursPerWeek())
      .reduce ((h, memo) -> memo + h), 0
      .value()
