Template.appointments.onCreated ->
  @autorun =>
    @subscribe('appointments')

Template.appointments.helpers
  byHour: ->
    [8..22].map (hour) ->
      time = moment().hour(hour)
      start = Time.time(time.startOf('hour'))
      appointments = Appointments.findOpen(time, 'hour')
      appointmentsCount = appointments.count()
      hasAppointments = appointmentsCount > 0
      return { start, time, appointments, appointmentsCount, hasAppointments }

  byAssignee: ->
    object = _.groupBy(@appointments.fetch(), (a) -> a?.assigneeId)
    _.map object, (appointments, assigneeId) ->
      if assigneeId
        { appointments, assignee: Meteor.users.findOne(assigneeId) }
      else
        { appointments }

  title: ->
    FlowRouter.watchPathChange()
    status = FlowRouter.current().params?.status or ''
    status = s.capitalize(status)
    return TAPi18n.__("appointments.this#{status}")

  currentDate: ->
    moment()
