{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Reports } = require 'api/reports'

module.exports = ->
  Meteor.publish 'reports', (options) ->
    return unless @userId and Roles.userIsInRole(@userId, ['reports', 'admin'], Roles.GLOBAL_GROUP)
    check options, Match.Optional
      date: Match.Optional(Date)

    showRevenue = (Roles.userIsInRole(@userId, ['reports-showRevenue', 'admin'], Roles.GLOBAL_GROUP))
    if (showRevenue)
      return Reports.find({})
    else
      return Reports.find({}, { fields: {
        'total.revenue': 0,
        'total.revenuePerAssignee': 0,
        'assignees.revenue': 0
      } })
