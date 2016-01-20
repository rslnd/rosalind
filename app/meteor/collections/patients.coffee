@Patients = new Mongo.Collection('patients')
Ground.Collection(Patients)

Schema.Patients = new SimpleSchema
  external:
    optional: true
    type: new SimpleSchema
      eoswin:
        optional: true
        type: new SimpleSchema
          id:
            type: String
            index: 1

      terminiko:
        optional: true
        type: new SimpleSchema
          id:
            type: String
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

  externalUpdatedAt:
    type: Date
    optional: true

  externalUpdatedBy:
    type: String
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
  Search.index('patients', @_id)

Patients.after.update (userId, doc) ->
  console.log('[Patient] updated:', doc._id)
  Search.index('patients', doc)

Patients.after.remove (userId, doc) ->
  console.log('[Patient] removed:', doc._id)
  Search.unindex('patients', doc)


Meteor.startup ->
  Patients.attachSchema(Schema.Patients)
  Patients.attachBehaviour('softRemovable')
