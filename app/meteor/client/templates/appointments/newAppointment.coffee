AutoForm.hooks
  insertAppointmentForm:
    onSubmit: (insertDoc) ->
      Appointments.insert(insertDoc)
      @done()
      false
