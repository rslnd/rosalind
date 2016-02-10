Template.schedulesDefault.onCreated ->
  @autorun =>
    @subscribe('schedules')

Template.schedulesDefault.helpers
  schedulesDefault: ->
    Meteor.users.find({})

  viewUser: ->
    FlowRouter.watchPathChange()
    idOrUsername = FlowRouter.current().params.idOrUsername
    if (idOrUsername)
      Meteor.users.findOneByIdOrUsername(idOrUsername)
    else
      Meteor.user()

  schedulesDefaultOptions: ->
    id: 'schedules-calendar'
    height: 'auto'
    firstDay: 1
    hiddenDays: [ 0 ]
    slotDuration: '00:30:00'
    minTime: '06:00:00'
    maxTime: '22:00:00'
    lang: 'de'
    header:
      left: 'prev,next today'
      center: 'title'
    defaultView: 'agendaWeek'
    resourceAreaWidth: '0px'
    titleFormat: 'dddd, D. MMMM'
    timezone: 'false'
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    events: (start, end, timezone, callback) ->
      range = { start: start.toISOString(), end: end.toISOString() }
      Session.set('schedules-currentView', range)
      events = Schedules.getEvents(range)

      # Make past days read-only
      events.push
        start: moment(0)
        end: moment().startOf('day')
        rendering: 'background'
        color: '#d1d1d1'
        overlap: false

      # Mute past hours, but keep editable
      events.push
        start: moment().startOf('day')
        end: moment()
        rendering: 'background'
        color: '#d1d1d1'

      callback(events)

    eventDrop: (event, delta, revertFunc) ->
      Schedules.updateEvent(event._id, event)

    eventResize: (event, delta, revertFunc) ->
      Schedules.updateEvent(event._id, event)


Meteor.startup ->
  Tracker.autorun ->
    Schedules.find({}).fetch()
    $('#schedules-calendar').fullCalendar('refetchEvents')


Template.schedulesDefault.created = ->
  Schedules.clientUpdateInterval = Meteor.setInterval(
    -> $('#schedules-calendar').fullCalendar('refetchEvents'),
    15 * 60 * 1000)

Template.schedulesDefault.destroyed = ->
  if (Schedules.clientUpdateInterval)
    Meteor.clearInterval(Schedules.clientUpdateInterval)
