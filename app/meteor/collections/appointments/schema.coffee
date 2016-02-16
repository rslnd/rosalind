@Appointments = new Mongo.Collection 'appointments',
  idGeneration: 'MONGO'

Schema.Appointments = new SimpleSchema
  start:
    type: Date
    index: -1

  end:
    type: Date

  type:
    type: String

  admittedAt:
    type: Date
    optional: true
    index: 1

  admittedBy:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

  treatedAt:
    type: Date
    optional: true
    index: 1

  treatedBy:
    type: SimpleSchema.RegEx.Id
    optional: true
    index: 1

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

  heuristic:
    type: Boolean
    optional: true
    index: 1

  external:
    optional: true
    type: Schema.External

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true

  createdBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Util.autoCreatedBy
    optional: true

  removed:
    type: Boolean
    optional: true
    index: 1


Meteor.startup ->
  Schema.Appointments.i18n('appointments.form')
  Appointments.attachSchema(Schema.Appointments)
  Appointments.attachBehaviour('softRemovable')
