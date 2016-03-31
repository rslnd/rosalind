{ Meteor } = require 'meteor/meteor'
{ Mongo } = require 'meteor/mongo'
helpersProfile = require '/imports/util/helpersProfile'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema/users'

Meteor.users.attachSchema(Schema)
Meteor.users.helpers(helpersProfile)
Meteor.users.helpers(helpers)
Meteor.users.helpers({ collection: -> Meteor.users })

Meteor.users.methods = methods(Meteor.users)

module.exports = Meteor.users
