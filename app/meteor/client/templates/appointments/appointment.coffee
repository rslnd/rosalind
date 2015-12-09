Template.appointment.helpers
  patient: ->
    Meteor.users.findOne(@patientId)

  assignee: ->
    Meteor.users.findOne(@assigneeId)

Template.appointment.events
  'click .admit': ->
    Appointments.setAdmitted(@_id)

  'click .treat': ->
    Appointments.setTreated(@_id)

  'click .resolve': ->
    Appointments.setResolved(@_id)
