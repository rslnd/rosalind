Template.appointment.helpers
  patient: ->
    Meteor.users.findOne(@patientId)

  assignee: ->
    Meteor.users.findOne(@assigneeId)

Template.appointment.events
  'click .admit': ->
    Appointments.setAdmitted(@_id)
