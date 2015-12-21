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

  note:
    type: String
    optional: true

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

Patients.helpers
  collection: ->
    Patients

Patients.after.insert (userId, doc) ->
  console.log('[Patient] inserted:', doc._id)
  Search.index(doc, 'patients')

Patients.after.update (userId, doc) ->
  console.log('[Patient] updated:', doc._id)
  Search.index(doc, 'patients')

Patients.after.remove (userId, doc) ->
  console.log('[Patient] removed:', doc._id)
  Search.unindex(doc, 'patients')


Meteor.startup ->
  Patients.attachSchema(Schema.Patients)
  Patients.attachBehaviour('softRemovable')
