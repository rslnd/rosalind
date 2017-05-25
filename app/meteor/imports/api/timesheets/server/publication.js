import moment from 'moment-timezone'
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Timesheets } from '../'

export default () => {
  Meteor.publish('timesheets', function () {
    if (this.userId) {
      return Timesheets.find({
        userId: this.userId,
        start: { $gt: moment().startOf('day').toDate() }
      }, { sort: { end: -1 } })
    }
  })

  Meteor.publish('timesheets-range', function (options) {
    check(options, Match.Optional({
      userId: Match.Optional(String),
      start: Match.Optional(Date),
      end: Match.Optional(Date)
    }))

    if (this.userId) {
      const userId = options.userId || this.userId
      const start = { $gt: moment(options.start).startOf('day').toDate() }
      let selector = { userId, start }

      if (options.end) {
        selector.end = { $lt: moment(options.end).endOf('day').toDate() }
      }

      return Timesheets.find(selector, { sort: { end: -1 } })
    }
  })

  Meteor.publish('timesheets-allToday', function () {
    if (this.userId && Roles.userIsInRole(this.userId, ['timesheets', 'admin'], Roles.GLOBAL_GROUP)) {
      return Timesheets.find({
        start: { $gt: moment().startOf('day').toDate() }
      }, { sort: { end: -1 } })
    }
  })
}
