@newAppointment = new ReactiveDict

Template.newAppointment.onCreated ->
  newAppointment.clear()
  newAppointment.set('step', 'patient')
