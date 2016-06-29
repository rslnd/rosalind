{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Schedules, Users } = require 'api'

module.exports = ->
  Meteor.publishComposite 'schedules', (options = {}) ->
    check(options, Object)
    return unless (@userId and Roles.userIsInRole(@userId, ['schedules', 'admin'], Roles.GLOBAL_GROUP))

    {
      find: -> Schedules.find({})
      children: [
        { find: (schedule) -> Users.find({ _id: schedule.userId }) }
      ]
    }
