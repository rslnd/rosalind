Template.schedulesDefaultCalendar.helpers
  calendarOptions: ->
    id: 'schedules-calendar'
    height: 'auto'
    firstDay: 1
    hiddenDays: [ 0 ]
    slotDuration: '00:30:00'
    minTime: '06:00:00'
    maxTime: '22:00:00'
    lang: 'de'
    header: false
    defaultView: 'agendaWeek'
    resourceAreaWidth: '0px'
    allDaySlot: false
    columnFormat: 'dddd'
    timezone: false
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    events: (start, end, timezone, callback) ->
      events = Schedules.getEvents
        selector:
          $or: [
            { userId: Template.schedulesDefault.currentView.get('userId') }
            { type: 'businessHours' }
          ]

      callback(events)

    eventDrop: (event, delta, revertFunc) ->
      Schedules.updateEvent(event._id, event)

    eventResize: (event, delta, revertFunc) ->
      Schedules.updateEvent(event._id, event)


Template.schedulesDefaultCalendar.onCreated ->
  @autorun ->
    user = Meteor.users.findOne(_id: Template.schedulesDefault.currentView.get('userId'))
    Schedules.find({}).fetch()
    $('#schedules-calendar').fullCalendar('refetchEvents')
