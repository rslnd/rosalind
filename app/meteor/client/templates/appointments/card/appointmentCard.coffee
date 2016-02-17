Template.appointmentCard.events
  'click .admit': ->
    Appointments.setAdmitted(@_id)

  'click .treat': ->
    Appointments.setTreated(@_id)

  'click .resolve': ->
    Appointments.setResolved(@_id)

Template.appointmentCard.helpers
  patientIdButNoPatient: ->
    @patientId?._str and not @patient()
