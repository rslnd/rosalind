moment = require 'moment'
{ ReactiveDict } = require 'meteor/reactive-dict'
{ SubsManager } = require 'meteor/meteorhacks:subs-manager'
{ Appointments } = require '/imports/api/appointments'

Template.appointments.currentView = new ReactiveDict
AppointmentsManager = new SubsManager()

Template.appointments.currentView.watchPathChange = ->
  date = FlowRouter.current().params?.date
  if date then date = moment(date).toDate() else date = new Date()
  @set('date', date)

Template.appointments.currentView.today = ->
  @set('date', new Date())

Template.appointments.currentView.previous = ->
  console.log('prev')
  previous = moment(@get('date')).subtract(1, 'day').toDate()
  @set('date', previous)

Template.appointments.currentView.next = ->
  console.log('next')
  next = moment(@get('date')).add(1, 'day').toDate()
  @set('date', next)

Template.appointments.onCreated ->
  Template.appointments.ready = new ReactiveVar()
  Template.appointments.currentView.watchPathChange()

  @autorun ->
    date = Template.appointments.currentView.get('date')
    Template.appointments.ready.set(false)
    handle = AppointmentsManager.subscribe('appointments', { date })
    Template.appointments.ready.set(handle.ready())

    date = moment(date).format('YYYY-MM-DD')
    FlowRouter.go('/appointments/' + date)


Template.appointments.helpers
  date: ->
    Template.appointments.currentView.get('date')

  appointments: ->
    Appointments.find({})
