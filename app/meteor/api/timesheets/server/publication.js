import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { Timesheets } from 'api/timesheets'

export default () => {
  Meteor.publish('timesheets', function () {
    if (this.userId) {
      return Timesheets.find({
        userId: this.userId,
        start: { $gt: moment().subtract(1, 'day').toDate() }
      }, { sort: { end: -1 } })
    }
  })
}
