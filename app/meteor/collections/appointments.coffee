@Appointments = new Mongo.Collection('appointments')
Ground.Collection(Appointments)


Schema.Appointments = new SimpleSchema
  start:
    type: Date
    index: -1

  end:
    type: Date

  type:
    type: String

  arrivedAt:
    type: Date
    optional: true

  treatmentAt:
    type: Date
    optional: true

  patientId:
    type: SimpleSchema.RegEx.Id
    index: 1

  assigneeId:
    type: SimpleSchema.RegEx.Id
    index: 1

  assistantIds:
    type: [SimpleSchema.RegEx.Id]
    optional: true

  note:
    type: String
    optional: true

  privateAppointment:
    type: Boolean

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true

  createdBy:
    type: String
    autoValue: Util.autoCreatedBy
    optional: true


Appointments.helpers
  privateOrInsurance: ->
    if @privatePatient
      TAPi18n.__('appointments.private')
    else
      TAPi18n.__('appointments.insurance')

  collection: ->
    Appointments


Meteor.startup ->
  Schema.Appointments.i18n('appointments.form')
  Appointments.attachSchema(Schema.Appointments)
  Appointments.attachBehaviour('softRemovable')
