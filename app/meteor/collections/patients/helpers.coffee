Meteor.startup ->
  Helpers.profile(Patients)

  Patients.helpers
    collection: ->
      Patients

    notes: ->
      n = [@note, @external?.eoswin?.note]
      return _.filter(n, (s) -> s and s.length >= 1).join('\n')

    appointments: ->
      Appointments.find patientId: @_id,
        sort:
          start: -1
