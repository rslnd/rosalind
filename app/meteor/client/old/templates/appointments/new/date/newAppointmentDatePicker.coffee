Template.newAppointmentDatePicker.helpers
  currentStep: ->
    if newAppointment.get('patient') and
      not newAppointment.get('date')
        'box-info'
      else
        'box-default'
