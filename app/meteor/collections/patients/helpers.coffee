Meteor.startup ->
  Helpers.profile(Patients)

  Patients.helpers
    collection: ->
      Patients

    notes: ->
      n = [@note, @external?.eoswin?.note]
      return _.filter(n, (s) -> s and s.length >= 1).join('\n')

    appointments: (selector = {}) ->
      selector = _.extend(selector, patientId: @_id)
      Appointments.find selector,
        sort:
          start: -1

    pastAppointments: ->
      @appointments(start: { $lt: Time.startOfToday() })

    futureAppointments: ->
      @appointments(start: { $gt: Time.startOfToday() })
