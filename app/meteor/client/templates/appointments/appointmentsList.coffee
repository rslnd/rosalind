Template.appointmentsList.helpers
  nameOrNote: ->
    if patient = @patient()
      patient.fullNameWithTitle()
    else
      @notes()

  klass: ->
    return 'appointment-admitted' if @admittedAt

Template.appointmentsList.events
  'click .list-group-item': ->
    Appointments.toggleAdmitted(@_id)
