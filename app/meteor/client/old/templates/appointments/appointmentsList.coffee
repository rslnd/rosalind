{ Mongo } = require 'meteor/mongo'
{ Patients } = require '/imports/api/patients'
{ Appointments } = require '/imports/api/appointments'

Template.appointmentsList.helpers
  nameOrNote: ->
    if @patientId?._str
      patient = Patients.findOne(_id: new Mongo.ObjectID(@patientId._str))
      patient.fullNameWithTitle()
    else
      @notes()

  klass: ->
    return 'appointment-admitted' if @admittedAt

Template.appointmentsList.events
  'click .list-group-item': ->
    Appointments.methods.toggleAdmitted(@_id)
