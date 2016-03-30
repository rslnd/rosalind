subs = new SubsManager()

Template.newAppointmentFindPatientProfile.helpers
  hasPastAppointments: ->
    @pastAppointments().count() > 0

  hasFutureAppointments: ->
    @futureAppointments().count() > 0

  hasContacts: ->
    @profile?.contacts and @profile.contacts.length > 0

  patient: ->
    ids = PatientsSearch.getData().map (p) -> p._id

    subs.subscribe('patients', ids)

    id = newAppointment.get('patientId')
    Patients.findOne(_id: new Mongo.ObjectID(id))
