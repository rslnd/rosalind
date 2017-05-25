import { Meteor } from 'meteor/meteor'
import { Cache } from '../'

module.exports = ->
  Meteor.publish 'cache', (options) ->
    return unless @userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)

    Cache.find({})
