{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Schedules } = require 'api/schedules'
{ Users } = require 'api/users'
{ Comments } = require 'api/comments'

module.exports = ->
  Meteor.publishComposite 'schedules', (range) ->
    check(range, Match.Optional({
      start: Date,
      end: Date
    }))

    return unless (@userId and Roles.userIsInRole(@userId, ['schedules', 'admin'], Roles.GLOBAL_GROUP))

    if (range)
      selector = {
        start: { $gt: moment(range.start).startOf('day').toDate() }
        end: { $gt: moment(range.end).endOf('day').toDate() }
      }
    else
      selector = { $or: [
        { type: 'default' },
        { type: 'businessHours' },
        { type: 'businessHoursOverride' },
        { type: 'holidays' },
        { type: 'override' }
      ] }

    {
      find: ->
        cursor = Schedules.find(selector, { limit: 300 })
        console.log('[Schedules] Publishing', {
          count: cursor.count(),
          selector
        })
        return cursor
      children: [
        { find: (schedule) -> Users.find({ _id: schedule.userId }) }
        { find: (schedule) -> Comments.find({ docId: schedule._id }) }
      ]
    }
