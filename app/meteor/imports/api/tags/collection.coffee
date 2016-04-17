{ Mongo } = require 'meteor/mongo'
methods = require './methods'
Schema = require './schema'

Tags = new Mongo.Collection('tags')
Tags.attachSchema(Schema)
Tags.attachBehaviour('softRemovable')
Tags.helpers({ collection: -> Tags })
Tags.methods = methods(Tags)

module.exports = Tags
