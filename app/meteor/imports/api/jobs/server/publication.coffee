{ Meteor } = require 'meteor/meteor'
{ Roles } = require 'meteor/alanning:roles'
{ Users } = require '/imports/api/users'

module.exports = ->
  TabularJobCollections.authenticateMethods = (userId) ->
    user = Users.findOne(userId)
    user and Roles.userIsInRole(user, 'admin')
