Template.newAppointmentFindPatientSearchResults.helpers
  getPatients: ->
    results = PatientsSearch.getData
      sort: { _score: -1 }
      limit: 5

    results.map (r, i) ->
      r._index = i
      return r

  fullNameWithTitle: (profile) ->
    full = [
      profile.titlePrepend
      profile.firstName
      profile.lastName
    ]

    full.push(', ' + profile.titleAppend) if profile.titleAppend

    _.filter full, (s) -> s and s.length > 0
      .join(' ')
