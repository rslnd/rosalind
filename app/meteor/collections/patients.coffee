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

Patients.helpers
  collection: ->
    Patients

  appointments: ->
    Appointments.find patientId: @_id,
      sort:
        start: -1

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
