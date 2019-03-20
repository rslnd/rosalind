import moment from 'moment'
import { Schedules } from '../'
import { publish } from '../../../util/meteor/publish'
import { dayToDate, daySelector } from '../../../util/time/day'

export default () => {
  publish({
    name: 'schedules-day',
    args: {
      year: Number,
      month: Number,
      day: Number,
      calendarId: String
    },
    roles: ['appointments-*', 'schedules', 'schedules-edit'],
    fn: function ({ year, month, day, calendarId }) {
      const date = dayToDate({ year, month, day })
      const selector = {
        calendarId,
        $or: [
          {
            type: 'override',
            start: {
              $gte: moment(date).startOf('day').toDate(),
              $lte: moment(date).endOf('day').toDate()
            }
          },
          {
            type: 'day',
            ...daySelector({ year, month, day })
          }
        ]
      }

      return Schedules.find(selector, {
        sort: {
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
    roles: ['appointments-*', 'schedules-edit'],
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
