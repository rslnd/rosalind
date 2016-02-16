@Patients = new Mongo.Collection 'patients',
  idGeneration: 'MONGO'

Schema.Patients = new SimpleSchema
  insuranceId:
    type: String
    optional: true
    index: 1

  note:
    type: String
    optional: true

  profile:
    type: Schema.Profile
    optional: true

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
  Patients.attachSchema(Schema.Patients)
  Patients.attachBehaviour('softRemovable')
