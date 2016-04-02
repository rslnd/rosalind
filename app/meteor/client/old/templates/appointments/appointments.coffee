{ Appointments } = require '/imports/api/appointments'
{ Users } = require '/imports/api/users'
Time = require '/imports/util/time'

Template.appointments.onCreated ->
  @autorun =>
    @subscribe('appointments')

Template.appointments.helpers
  byHour: ->
    [8..22].map (hour) ->
      time = moment().hour(hour)
      start = Time.time(time.startOf('hour'))
      appointments = Appointments.methods.findAll(time, 'hour')
      appointmentsCount = appointments.count()
      hasAppointments = appointmentsCount > 0
      return { start, time, appointments, appointmentsCount, hasAppointments }

  byAssignee: ->
    object = _.groupBy(@appointments.fetch(), (a) -> a?.assigneeId)
    _.map object, (appointments, assigneeId) ->
      if assigneeId
        { appointments, assignee: Users.findOne(assigneeId) }
      else
        { appointments }

  title: ->
    FlowRouter.watchPathChange()
    status = FlowRouter.current().params?.status or ''
    status = s.capitalize(status)
    return TAPi18n.__("appointments.this#{status}")

  currentDate: ->
    moment().format(TAPi18n.__('time.dateFormat'))
