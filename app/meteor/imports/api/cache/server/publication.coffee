{ Meteor } = require 'meteor/meteor'
{ Cache } = require '/imports/api/cache'

module.exports = ->
  Meteor.publish 'cache', (options) ->
    return unless @userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)

    Cache.find({})
