@newAppointment = new ReactiveDict

Template.newAppointment.onCreated ->
  newAppointment.clear()
