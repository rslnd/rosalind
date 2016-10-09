{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Schedules } = require 'api/schedules'
{ Users } = require 'api/users'
{ Comments } = require 'api/comments'

module.exports = ->
  Meteor.publishComposite 'schedules', (options = {}) ->
    check(options, Object)
    return unless (@userId and Roles.userIsInRole(@userId, ['schedules', 'admin'], Roles.GLOBAL_GROUP))

    {
      find: -> Schedules.find({ $or: [
          { type: 'default' },
          { type: 'businessHours' },
          { type: 'businessHoursOverride' },
          { type: 'holidays' }
        ] }, { limit: 300 })
      children: [
        { find: (schedule) -> Users.find({ _id: schedule.userId }) }
        { find: (schedule) -> Comments.find({ docId: schedule._id }) }
      ]
    }
