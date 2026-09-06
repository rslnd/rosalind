import moment from 'moment-timezone'
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
            $or: [
              { type: 'override' },
              { type: 'overlay' }
            ],
            start: {
              $gte: moment(date).startOf('day').toDate(),
              $lte: moment(date).endOf('day').toDate()
            }
          },
          {
            type: 'day',
            ...daySelector({ year, month, day })
          },
          {
            // Vacations overlapping this day (per assignee, shown in the panel)
            type: 'vacation',
            start: { $lte: moment(date).endOf('day').toDate() },
            end: { $gte: moment(date).startOf('day').toDate() }
          },
          {
            // Holidays overlapping this day (for the "closed" banner/toggle)
            type: 'holiday',
            start: { $lte: moment(date).endOf('day').toDate() },
            end: { $gte: moment(date).startOf('day').toDate() }
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

  // All schedule data needed to render the month overview for one calendar:
  // overrides, overlays, day schedules, vacations (calendar-scoped) and
  // holidays (practice-wide).
  publish({
    name: 'schedules-month',
    args: {
      year: Number,
      month: Number,
      calendarId: String
    },
    roles: ['appointments-*', 'schedules', 'schedules-edit'],
    fn: function ({ year, month, calendarId }) {
      // month is 1-indexed (consistent with schedules-day and stored `day`)
      const start = moment.tz({ year, month: month - 1, day: 1 }, 'Europe/Vienna').startOf('month')
      const end = start.clone().endOf('month')

      return Schedules.find({
        $or: [
          {
            calendarId,
            type: { $in: ['override', 'overlay', 'vacation'] },
            start: { $lte: end.toDate() },
            end: { $gte: start.toDate() }
          },
          {
            // day schedules use `day` ({ year, month, day }) instead of start/end
            calendarId,
            type: 'day',
            'day.year': year,
            'day.month': month
          },
          {
            type: 'holiday',
            start: { $lte: end.toDate() },
            end: { $gte: start.toDate() }
          }
        ]
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

  // All (recent + future) vacations of a calendar, used to highlight already
  // entered vacations in the vacation date picker.
  publish({
    name: 'schedules-vacations',
    args: {
      calendarId: String
    },
    roles: ['appointments-*', 'schedules', 'schedules-edit'],
    fn: function ({ calendarId }) {
      return Schedules.find({
        type: 'vacation',
        calendarId,
        removed: { $ne: true },
        end: { $gte: moment().subtract(1, 'year').startOf('day').toDate() }
      })
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
