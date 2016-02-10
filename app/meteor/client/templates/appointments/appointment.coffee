Template.appointment.helpers

Template.appointment.events
  'click .admit': ->
    Appointments.setAdmitted(@_id)

  'click .treat': ->
    Appointments.setTreated(@_id)

  'click .resolve': ->
    Appointments.setResolved(@_id)
