Template.appointments.onCreated ->
  @autorun =>
    @subscribe('appointments')

Template.appointments.helpers
  appointments: ->
    status = Router.current().params?.status
    console.log status
    switch status
      when 'admitted' then Appointments.findAdmitted()
      when 'treating' then Appointments.findTreating()
      else Appointments.findOpen()
