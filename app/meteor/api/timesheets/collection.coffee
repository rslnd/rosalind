{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema'

Timesheets = new Mongo.Collection('timesheets')
Timesheets.attachSchema(Schema)
Timesheets.helpers(helpers)
Timesheets.helpers({ collection: -> Timesheets })

Timesheets.methods = methods({ Timesheets })

module.exports = Timesheets
