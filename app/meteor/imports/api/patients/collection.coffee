{ Mongo } = require 'meteor/mongo'
helpersProfile = require '/imports/util/helpersProfile'
helpers = require './helpers'
hooks = require './hooks'
Schema = require './schema'

Patients = new Mongo.Collection 'Patients',
  idGeneration: 'MONGO'

Patients.attachSchema(Schema)
Patients.attachBehaviour('softRemovable')
Patients.helpers(helpers)
Patients.helpers(helpersProfile)
hooks(Patients)

module.exports = Patients
