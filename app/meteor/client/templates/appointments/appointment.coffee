Template.appointment.helpers
  patient: ->
    Meteor.users.findOne(@patientId)

  assignee: ->
    Meteor.users.findOne(@assigneeId)
