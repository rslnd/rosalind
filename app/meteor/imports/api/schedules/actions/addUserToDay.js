import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day } from '../../../util/schema/day'
import { Events } from '../../events'
import { daySelector } from '../../../util/time/day'

export const addUserToDay = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/addUserToDay',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id },
      calendarId: { type: SimpleSchema.RegEx.Id },
      day: { type: Day }
    }).validator(),

    run ({ day, calendarId, userId }) {
      if (this.connection && !this.userId ||
        !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const existingSchedule = Schedules.findOne({
        ...daySelector(day),
        calendarId,
        type: 'day'
      })

      if (existingSchedule) {
        Schedules.update({ _id: existingSchedule._id }, {
          $addToSet: { userIds: userId }
        })

        Events.post('schedules/addUserToDayUpdate', { scheduleId: existingSchedule._id, userId })
        return existingSchedule._id
      } else {
        const schedule = {
          type: 'day',
          userIds: [ userId ],
          calendarId,
          day
        }

        const scheduleId = Schedules.insert(schedule, (err) => {
          if (err) { throw err }
          Events.post('schedules/addUserToDayInsert', { scheduleId, userId })
        })
        return scheduleId
      }
    }
  })
}
