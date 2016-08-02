import moment from 'moment'
import { Meteor } from 'meteor/meteor'
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
}
