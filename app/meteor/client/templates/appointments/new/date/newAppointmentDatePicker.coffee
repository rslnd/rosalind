Template.newAppointmentDatePicker.helpers
  currentStep: ->
    if newAppointment.get('step') is 'date' then 'box-info' else 'box-default'
