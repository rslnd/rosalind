{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
actions = require './actions'
Schema = require './schema'

Timesheets = new Mongo.Collection('timesheets')
Timesheets.attachSchema(Schema)
Timesheets.helpers(helpers)
Timesheets.helpers({ collection: -> Timesheets })
Timesheets.methods = methods({ Timesheets })
Timesheets.actions = actions({ Timesheets })

module.exports = Timesheets
