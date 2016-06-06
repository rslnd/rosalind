_ = require 'lodash'
{ Appointments } = require '/imports/api/appointments'
{ Patients } = require '/imports/api/patients'
{ Users } = require '/imports/api/users'

AppointmentsManager = new SubsManager()

Template.appointmentsCalendar.onCreated ->
  @ready = new ReactiveVar()
  @autorun =>
    handle = AppointmentsManager.subscribe('appointments')
    @ready.set(handle.ready())

renderCalendar = ->
  resources = _.map Appointments.find({}).fetch(), (a) ->
    {
      id: a?.assigneeId.toString()
      title: Users.findOne({ _id: a?.assigneeId })?.fullNameWithTitle()
    }
  resources = _.sortBy(resources, 'title')

  $('#appointments-calendar').fullCalendar
    height: 'auto'
    firstDay: 1
    hiddenDays: [ 0 ]
    slotDuration: '00:05:00'
    minTime: '06:00:00'
    maxTime: '22:00:00'
    lang: 'de'
    defaultView: 'agendaDay'
    resourceAreaWidth: '0px'
    allDaySlot: true
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
  @autorun =>
    console.log('[Appointments] Rendered calendar, ready', @ready.get())
    renderCalendar() if @ready.get()

  @autorun =>
    Appointments.find({}).fetch()
    console.log('[Appointments] Autorun refetch events')
    $('#appointments-calendar').fullCalendar('refetchEvents') if @ready.get()
