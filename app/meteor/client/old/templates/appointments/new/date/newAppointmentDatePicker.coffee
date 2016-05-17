Template.newAppointmentDatePicker.helpers
  currentStep: ->
    if newAppointment.get('patient') and
      not newAppointment.get('date')
        'box-info'
      else
        'box-default'

Template.newAppointmentDatePicker.onRendered ->
  Meteor.defer ->
    newAppointment.setDefault('date', new Date())
    newAppointment.setDefault('hour', 11)
    newAppointment.setDefault('minute', 0)
