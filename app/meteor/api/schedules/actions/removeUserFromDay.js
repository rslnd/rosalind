import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day } from 'util/schema/day'
import { Events } from 'api/events'

export const removeUserFromDay = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/removeUserFromDay',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id },
      day: { type: Day }
    }).validator(),

    run ({ day, userId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const existingSchedule = Schedules.findOne({ day, type: 'day' })

      if (existingSchedule) {
        Schedules.update({ _id: existingSchedule._id }, {
          $pull: { userIds: userId }
        })

        Events.post('schedules/removeUserFromDayUpdate', { scheduleId: existingSchedule._id, userId })
        return existingSchedule._id
      } else {
        return false
      }
    }
  })
}
