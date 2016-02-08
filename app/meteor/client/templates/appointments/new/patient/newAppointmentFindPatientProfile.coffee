subs = new SubsManager()

Template.newAppointmentFindPatientProfile.helpers
  patient: ->
    ids = PatientsSearch.getData().map (p) -> p._id

    subs.subscribe('patients', ids)

    id = newAppointment.get('patientId')
    Patients.findOne(_id: new Mongo.ObjectID(id))
