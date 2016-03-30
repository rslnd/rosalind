{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Reports } = require '/imports/api/reports'

module.exports = ->
  Meteor.publish 'reports', (options) ->
    return unless @userId and Roles.userIsInRole(@userId, ['reports', 'admin'], Roles.GLOBAL_GROUP)
    check options, Match.Optional
      date: Match.Optional(Date)

    Reports.find({})
