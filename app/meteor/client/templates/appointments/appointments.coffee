Template.appointments.onCreated ->
  @autorun =>
    @subscribe('appointments')

Template.appointments.helpers
  appointments: ->
    status = FlowRouter.current().params?.status
    console.log('param status: ', status)
    switch status
      when 'admitted' then Appointments.findAdmitted()
      when 'treating' then Appointments.findTreating()
      else Appointments.findOpen()
