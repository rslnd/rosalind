{ Mongo } = require 'meteor/mongo'
hooks = require './hooks'
methods = require './methods'
Schema = require './schema'

Reports = new Mongo.Collection('Reports')
Reports.attachSchema(Schema)
Reports.helpers({ collection: -> Reports })
Reports.methods = methods(Reports)
hooks(Reports)

module.exports = Reports
