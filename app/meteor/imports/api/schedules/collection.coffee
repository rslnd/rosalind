{ Mongo } = require 'meteor/mongo'
helpersProfile = require '/imports/util/helpersProfile'
methods = require './methods'
helpers = require './helpers'
Schema = require './schema'

Schedules = new Mongo.Collection('schedules')
Schedules.attachSchema(Schema)
Schedules.attachBehaviour('softRemovable')
Schedules.helpers(helpers)
Schedules.helpers({ collection: -> Schedules })

Schedules.methods = methods.default({ Schedules })

module.exports = Schedules
