Template.newAppointmentSummary.helpers
  summary: (key) ->
    newAppointment.get(key) or Helpers.noValue()
