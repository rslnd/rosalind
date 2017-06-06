import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Reports } from '../'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'

module.exports = ->
  Meteor.publish 'reports', (options) ->
    return unless (@userId and Roles.userIsInRole(@userId, ['reports', 'admin'], Roles.GLOBAL_GROUP)) or
       (@connection and isTrustedNetwork(@connection.clientAddress))

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
