import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Timesheets } from 'api/timesheets'

export default () => {
  Meteor.publish('timesheets', function () {
    if (this.userId) {
      return Timesheets.find({
        userId: this.userId,
        start: { $gt: moment().startOf('day').toDate() }
      }, { sort: { end: -1 } })
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
