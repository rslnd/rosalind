import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day } from '../../../util/schema/day'
import { Events } from '../../events'
import { daySelector, dayToDate } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'
import { Appointments } from '../../appointments'
import moment from 'moment-timezone'

export const removeUserFromDay = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/removeUserFromDay',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id },
      calendarId: { type: SimpleSchema.RegEx.Id },
      day: { type: Day }
    }).validator(),

    run ({ day, calendarId, userId }) {
      if ((this.connection && !this.userId) ||
        !hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      // Remove any bookables
      Appointments.remove({
        type: 'bookable',
        start: { $gte: moment(dayToDate(day)).startOf('day').toDate() },
        end: { $lte: moment(dayToDate(day)).endOf('day').toDate() },
        assigneeId: userId,
        calendarId
      }, { multi: true })

      // BUG: Bulk applying default schedules creates multiple day schedules, we should probably do away with day schedules altogether once availabilities are live.
      const existingSchedules = Schedules.find({
        ...daySelector(day),
        calendarId,
        userIds: userId,
        type: 'day'
      }).fetch()

      if (existingSchedules.length > 0) {
        const ids = existingSchedules.map(s => s._id)
        Schedules.update({ _id: { $in: ids } }, {
          $pull: { userIds: userId }
        })

        Events.post('schedules/removeUserFromDayUpdate', { scheduleId: ids, userId })
        return ids
      } else {
        return false
      }
    }
  })
}
