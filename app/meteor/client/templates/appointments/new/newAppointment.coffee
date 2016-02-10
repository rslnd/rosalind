@newAppointment = new ReactiveDict

Template.newAppointment.onCreated ->
  try
    newAppointment.clear()
  catch e
    console.warn('Dict Error:' + e)
