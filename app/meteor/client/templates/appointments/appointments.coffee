Template.appointments.onCreated ->
  @autorun =>
    @subscribe('appointments')

Template.appointments.helpers
  appointments: ->
    FlowRouter.watchPathChange()
    status = FlowRouter.current().params?.status
    switch status
      when 'admitted' then Appointments.findAdmitted()
      when 'treating' then Appointments.findTreating()
      else Appointments.findOpen()

  title: ->
    FlowRouter.watchPathChange()
    status = FlowRouter.current().params?.status or ''
    status = s.capitalize(status)
    return TAPi18n.__("appointments.this#{status}")

  currentDate: ->
    moment()
