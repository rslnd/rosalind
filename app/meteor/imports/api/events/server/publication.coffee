import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Events } from '../'

module.exports = ->
  Meteor.publish 'events', (options) ->
    return unless @userId and Roles.userIsInRole(@userId, ['events', 'admin'], Roles.GLOBAL_GROUP)
    check options, Match.Optional
      date: Match.Optional(Date)

    Events.find {},
      limit: 20
      sort: { createdAt: -1 }
