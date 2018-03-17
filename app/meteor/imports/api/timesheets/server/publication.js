import moment from 'moment-timezone'
import { Match } from 'meteor/check'
import { publish } from '../../../util/meteor/publish'
import { Timesheets } from '../'

export default () => {
  publish({
    name: 'timesheets',
    roles: ['timesheets'],
    fn: function () {
      if (this.userId) {
        return Timesheets.find({
          userId: this.userId,
          start: { $gt: moment().startOf('day').toDate() }
        }, { sort: { end: -1 } })
      }
    }
  })

  publish({
    name: 'timesheets-range',
    roles: ['timesheets'],
    args: {
      userId: Match.Optional(String),
      start: Match.Optional(Date),
      end: Match.Optional(Date)
    },
    fn: function ({ userId, start, end }) {
      if (this.userId) {
        if (!userId) {
          userId = this.userId
        }
        const start = { $gt: moment(start).startOf('day').toDate() }
        let selector = { userId, start }

        if (end) {
          selector.end = { $lt: moment(end).endOf('day').toDate() }
        }

        return Timesheets.find(selector, { sort: { end: -1 } })
      }
    }
  })

  publish({
    name: 'timesheets-allToday',
    roles: ['timesheets'],
    fn: function () {
      return Timesheets.find({
        start: { $gt: moment().startOf('day').toDate() }
      }, { sort: { end: -1 } })
    }
  })
}
