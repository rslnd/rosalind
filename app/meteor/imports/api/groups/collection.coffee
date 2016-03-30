{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema'

Groups = new Mongo.Collection('Groups')
Groups.attachSchema(Schema)
Groups.attachBehaviour('softRemovable')
Groups.helpers(helpers)
Groups.helpers({ collection: -> Groups })
Groups.methods = methods(Groups)

module.exports = Groups
