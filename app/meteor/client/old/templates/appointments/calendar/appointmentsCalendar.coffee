_ = require 'lodash'
{ dateWeekday, weekOfYear, specialDay } = require '/imports/util/time/format'
{ Appointments } = require '/imports/api/appointments'
{ Patients } = require '/imports/api/patients'
{ Users } = require '/imports/api/users'

renderCalendar = ->
  resources = _.chain(Appointments.find({}).fetch())
    .map (a) -> a.assigneeId
    .uniq()
    .map (_id) ->
      if _id
        user = Users.findOne({ _id })
        {
          id: user._id
          title: user.fullNameWithTitle()
          lastName: user.profile.lastName
        }
      else
        {
          id: 'unassigned'
          title: 'Unassigned'
        }
    .sortBy 'lastName'
    .value()

  console.log('resources', resources)

  $('#appointments-calendar').fullCalendar
    height: 'auto'
    firstDay: 1
    hiddenDays: [ 0 ]
    slotDuration: '00:05:00'
    slotWidth: 30
    minTime: '06:00:00'
    maxTime: '22:00:00'
    displayEventTime: false
    header: false
    lang: 'de'
    defaultView: 'agendaDay'
    resourceAreaWidth: '0px'
    allDaySlot: true
    nowIndicator: true
    viewRender: ->
      topBarHeight = $('.navbar-static-top').height()
      headerHeight = $('.appointments-calendar-header').outerHeight()

      $('.appointments-calendar-header').sticky
        topSpacing: topBarHeight
        zIndex: 2000
      $('.fc-head').sticky
        topSpacing: topBarHeight + headerHeight
        zIndex: 3000

    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    resources: resources
    events: (start, end, timezone, callback) ->
      console.log('[Appointments] Fetching events for calendar')
      # events = Appointments.methods.getEvents()

      events = Appointments.find({}).fetch()

      events = _.map events, (a) ->
        patient = Patients.findOne(_id: new Mongo.ObjectID(a.patientId?._str))

        a.resourceId = a.assigneeId
        a.title = _.filter([ patient?.fullName(), a.notes() ]).join('\n')
        return a

      callback(events)

    eventDrop: (event, delta, revertFunc) ->
      Appointments.methods.updateEvent(event._id, event)

    eventResize: (event, delta, revertFunc) ->
      Appointments.methods.updateEvent(event._id, event)

Template.appointmentsCalendar.onRendered ->
  @autorun ->
    console.log('[Appointments] Rendered calendar, ready', Template.appointments.ready.get())
    renderCalendar() if Template.appointments.ready.get()

  @autorun ->
    Appointments.find({}).fetch()
    console.log('[Appointments] Autorun refetch events')
    $('#appointments-calendar').fullCalendar('refetchEvents') if Template.appointments.ready.get()


  @autorun ->
    date = Template.appointments.currentView.get('date')
    $('#appointments-calendar').fullCalendar('gotoDate', date)

Template.appointmentsCalendar.helpers
  selectedDay: ->
    date = Template.appointments.currentView.get('date')
    dateWeekday(date)

  selectedWeek: ->
    date = Template.appointments.currentView.get('date')
    weekOfYear(date)

  specialDay: ->
    date = Template.appointments.currentView.get('date')
    specialDay(date)
