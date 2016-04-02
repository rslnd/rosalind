{ Appointments } = require '/imports/api/appointments'

Template.appointmentCard.events
  'click .admit': ->
    Appointments.methods.setAdmitted(@_id)

  'click .treat': ->
    Appointments.methods.setTreated(@_id)

  'click .resolve': ->
    Appointments.methods.setResolved(@_id)

Template.appointmentCard.helpers
  patientIdButNoPatient: ->
    @patientId?._str and not @patient()
