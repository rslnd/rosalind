Template.newAppointmentFindPatientSearchResults.helpers
  getPatients: ->
    results = PatientsSearch.getData
      sort: { _score: -1 }
      limit: 4

    results.map (r, i) ->
      r._index = i
      return r
