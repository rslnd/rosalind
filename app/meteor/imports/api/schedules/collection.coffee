{ Mongo } = require 'meteor/mongo'
helpersProfile = require '/imports/util/helpersProfile'
methods = require './methods'
helpers = require './helpers'
Schema = require './schema'

Schedules = new Mongo.Collection('Schedules')
Schedules.attachSchema(Schema)
Schedules.attachBehaviour('softRemovable')
Schedules.helpers(helpers)

Schedules.methods = methods(Schedules)

module.exports = Schedules
