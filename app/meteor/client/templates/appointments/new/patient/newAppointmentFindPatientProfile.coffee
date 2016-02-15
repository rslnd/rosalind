subs = new SubsManager()

Template.newAppointmentFindPatientProfile.helpers
  hasAppointments: ->
    @appointments.count() > 0

  patient: ->
    ids = PatientsSearch.getData().map (p) -> p._id

    subs.subscribe('patients', ids)

    id = newAppointment.get('patientId')
    Patients.findOne(_id: new Mongo.ObjectID(id))
