{ Mongo } = require 'meteor/mongo'
helpersProfile = require 'util/helpersProfile'
methods = require './methods'
actions = require './actions'
helpers = require './helpers'
Schema = require './schema'

Schedules = new Mongo.Collection('schedules')
Schedules.attachSchema(Schema)
Schedules.attachBehaviour('softRemovable')
Schedules.helpers(helpers)
Schedules.helpers({ collection: -> Schedules })
Schedules.actions = actions({ Schedules })
Schedules.methods = methods({ Schedules })

module.exports = Schedules
