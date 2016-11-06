{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ isTrustedNetwork } = require 'api/customer/server/isTrustedNetwork'
{ Schedules } = require 'api/schedules'
{ Users } = require 'api/users'
{ Comments } = require 'api/comments'

module.exports = ->
  Meteor.publishComposite 'schedules', (range) ->
    check(range, Match.Optional({
      start: Match.Optional(Date),
      end: Match.Optional(Date),
      day: Match.Optional(Number),
      month: Match.Optional(Number),
      year: Match.Optional(Number)
    }))

    return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'schedules', 'admin'], Roles.GLOBAL_GROUP)) or
      (@connection and isTrustedNetwork(@connection.clientAddress))

    # If no arguments are supplied, publish future schedules
    if (!range || (!range.start && !range.end && !range.day && !range.month && !range.year))
      selector = {
        $or: [
          {
            start: moment().startOf('day').toDate()
            end: moment().add(6, 'months').endOf('day').toDate()
          },
          {
            type: 'override' # FIXME: Limit schedules sent to client
          }
        ]
      }

    else if (range and (range.start or range.end))
      selector = {
        start: { $gt: moment(range.start).startOf('day').toDate() }
        end: { $gt: moment(range.end).endOf('day').toDate() }
      }
    else if (range and range.day)
      selector = { day: range }
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
        cursor = Schedules.find(selector, {
          sort: {
            'day.year': -1,
            start: -1
          },
          limit: 600
        })

        return cursor
      children: [
        { find: (schedule) -> Comments.find({ docId: schedule._id }) }
      ]
    }
