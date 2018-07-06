import moment from 'moment'
import { Match } from 'meteor/check'
import { Schedules } from '../'
import { Comments } from '../../comments'
import { publish } from '../../../util/meteor/publish'

export default () => {
  publish({
    name: 'schedules',
    args: {
      start: Match.Optional(Date),
      end: Match.Optional(Date),
      day: Match.Optional(Number),
      month: Match.Optional(Number),
      year: Match.Optional(Number)
    },
    roles: ['appointments', 'schedules', 'schedules-edit'],
    preload: true,
    fn: function ({ start, end, day, month, year }) {
      let selector = {}
      // If no arguments are supplied, publish future schedules
      if (!start && !end && !day && !month && !year) {
        selector = {
          $or: [
            {
              start: moment().startOf('day').toDate(),
              end: moment().add(6, 'months').endOf('day').toDate()
            },
            {
              type: 'override', // FIXME: Limit schedules sent to client
              start: { $gt: moment().subtract(1, 'week').startOf('day').toDate() },
              end: { $lt: moment().add(12, 'months').endOf('day').toDate() }
            },
            {
              type: 'day'
            }
          ]
        }
      } else if (start && end) {
        selector = {
          start: {
            $gt: moment(start).subtract(1, 'day').startOf('day').toDate(),
            $lt: moment(end).add(1, 'day').endOf('day').toDate()
          }
        }
      } else if (day && month && year) {
        selector = {
          'day.day': day,
          'day.month': month,
          'day.year': year
        }
      } else {
        selector = { $or: [
          { type: 'default' },
          { type: 'businessHours' },
          { type: 'businessHoursOverride' },
          { type: 'holiday' },
          { type: 'override' }
        ] }
      }

      // TODO: Sensibly limit schedules sent to client, 2-4k currently?
      return Schedules.find(selector, {
        sort: {
          'day.year': -1,
          start: -1
        }
      })
    }
  })

  publish({
    name: 'schedules-default',
    roles: ['schedules-edit'],
    fn: function () {
      return Schedules.find({ type: 'default' })
    }
  })

  publish({
    name: 'schedules-holidays',
    roles: ['appointments', 'schedules-edit'],
    fn: function () {
      return Schedules.find({
        type: 'holiday',
        start: {
          $gt: moment().subtract(1, 'month').startOf('day').toDate()
        }
      })
    }
  })

  publish({
    name: 'schedules-latest-planned',
    roles: ['schedules-edit'],
    args: {
      calendarId: String
    },
    fn: function ({ calendarId }) {
      return Schedules.find({
        type: 'override',
        calendarId
      }, {
        sort: { end: -1 },
        limit: 1
      })
    }
  })
}
