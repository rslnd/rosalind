{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema'

Timesheets = new Mongo.Collection('Timesheets')
Timesheets.attachSchema(Schema)
Timesheets.helpers(helpers)
Timesheets.helpers({ collection: -> Timesheets })

Timesheets.methods = methods

module.exports = Timesheets
