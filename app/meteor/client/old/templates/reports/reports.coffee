moment = require 'moment'
omit = require 'lodash/omit'
{ ReactiveDict } = require 'meteor/reactive-dict'
{ SubsManager } = require 'meteor/meteorhacks:subs-manager'
Time = require '/imports/util/time'
{ Reports } = require '/imports/api/reports'


Template.reports.currentView = new ReactiveDict
ReportsManager = new SubsManager()

Template.reports.currentView.watchPathChange = ->
  date = FlowRouter.current().params?.date
  if date then date = moment(date).toDate() else date = new Date()
  @set('date', date)

Template.reports.currentView.today = ->
  @set('date', new Date())

Template.reports.currentView.previous = ->
  previous = moment(@get('date')).subtract(1, 'day').toDate()
  @set('date', previous)

Template.reports.currentView.next = ->
  next = moment(@get('date')).add(1, 'day').toDate()
  @set('date', next)

Template.reports.currentView.toggleRevenue = ->
  @set('showRevenue', not @get('showRevenue'))

Template.reports.onCreated ->
  Template.reports.currentView.watchPathChange()

  @autorun ->
    date = Template.reports.currentView.get('date')

    ReportsManager.subscribe('reports', { date })

    date = moment(date).format('YYYY-MM-DD')
    FlowRouter.go('/reports/' + date)


Template.reports.helpers
  day: ->
    date = Template.reports.currentView.get('date')
    Time.dateToDay(moment(date))

  currentReport: ->
    if date = Template.reports.currentView.get('date')
      day = Time.dateToDay(date)
      day = omit(day, 'date')
      Reports.findOne({ day })
