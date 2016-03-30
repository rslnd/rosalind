{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema'

Appointments = new Mongo.Collection 'Appointments',
  idGeneration: 'MONGO'

Appointments.attachSchema(Schema)
Appointments.attachBehaviour('softRemovable')
Appointments.helpers({ collection: -> Appointments })
Appointments.helpers(helpers)
Appointments.methods = methods(Appointments)

module.exports = Appointments
