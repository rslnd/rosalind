filterFields = [
  'profile.titlePrepend'
  'profile.titleAppend'
  'profile.firstName'
  'profile.lastName'
]

options =
  keepHistory: 1000 * 60 * 30
  localSearch: false

@PatientsSearch = new SearchSource 'patients', filterFields, options

Template.patients.helpers
  birthday: (date) ->
    date = moment(date)
    return if date < moment().subtract(200, 'years')
    age = date.fromNow(true)
    formatted = date.format('D. MMMM YYYY')
    "#{formatted} (#{age})"

  getPatients: ->
    PatientsSearch.getData
      sort: { _score: -1 }

Template.patients.events
  'keyup #patient-search-box': (->
    handler = (e) ->
      queryString = $(e.target).val().trim()
      PatientsSearch.search(queryString)
    _.throttle(handler, 100)
  )()
