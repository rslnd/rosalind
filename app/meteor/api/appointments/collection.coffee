{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema'

Patients = require 'api/patients'
Users = require 'api/users'

Appointments = new Mongo.Collection 'appointments'
Appointments.attachSchema(Schema)
Appointments.attachBehaviour('softRemovable')
Appointments.helpers({ collection: -> Appointments })
Appointments.helpers(helpers)
Appointments.methods = methods({ Appointments })

module.exports = Appointments
