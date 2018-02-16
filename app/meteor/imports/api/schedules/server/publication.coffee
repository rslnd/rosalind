import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'
import { Schedules } from '../'
import { Users } from '../../users'
import { Comments } from '../../comments'

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
            start: { $gt: moment().subtract(1, 'week').startOf('day').toDate() }
            end: { $lt: moment().add(12, 'months').endOf('day').toDate() }
          },
          {
            type: 'day'
          }
        ]
      }

    else if (range and (range.start or range.end))
      selector = {
        start: {
          $gt: moment(range.start).subtract(1, 'day').startOf('day').toDate(),
          $lt: moment(range.end).add(1, 'day').endOf('day').toDate()
        }
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
          limit: 4000 # BUG: Figure out how to make sure no schedules are left out
        })

        return cursor
      children: [
        { find: (schedule) -> Comments.find({ docId: schedule._id }) }
      ]
    }
