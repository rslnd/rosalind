{ Meteor } = require 'meteor/meteor'
{ Mongo } = require 'meteor/mongo'
helpersProfile = require 'util/helpersProfile'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema/users'

Users = Meteor.users

Users.attachSchema(Schema)
Users.helpers(helpersProfile)
Users.helpers(helpers)
Users.helpers({ collection: -> Users })

Users.methods = methods(Users)

module.exports = Users
