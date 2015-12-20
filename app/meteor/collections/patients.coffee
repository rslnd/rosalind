@Patients = new Mongo.Collection('patients')
Ground.Collection(Patients)

Schema.Patients = new SimpleSchema
  externalId:
    type: String
    optional: true
    index: 1

  insuranceId:
    type: String
    optional: true
    index: 1

  profile:
    type: Schema.Profile
    optional: true

  importedAt:
    type: Date
    optional: true

  importedBy:
    type: SimpleSchema.RegEx.Id
    optional: true

  createdAt:
    type: Date
    autoValue: Util.autoCreatedAt
    optional: true

  createdBy:
    type: SimpleSchema.RegEx.Id
    autoValue: Util.autoCreatedBy
    optional: true

Meteor.startup ->
  Patients.attachSchema(Schema.Patients)
  Patients.attachBehaviour('softRemovable')
