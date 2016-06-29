{ Appointments } = require 'api/appointments'

Template.appointmentsCards.onCreated ->
  @autorun =>
    @subscribe('appointments')

Template.appointmentsCards.helpers
  appointments: ->
    FlowRouter.watchPathChange()
    status = FlowRouter.current().params?.status
    switch status
      when 'admitted' then Appointments.methods.findAdmitted()
      when 'treating' then Appointments.methods.findTreating()
      when '' then Appointments.methods.findOpen()

  title: ->
    FlowRouter.watchPathChange()
    status = FlowRouter.current().params?.status or ''
    status = s.capitalize(status)
    return TAPi18n.__("appointments.this#{status}")

  currentDate: ->
    moment()
