import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { weekdays, HM } from '../schema'

const FromTo = new SimpleSchema({
  from: { type: HM },
  to: { type: HM }
})

export const upsertDefaultSchedule = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/upsertDefaultSchedule',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id, optional: true },
      calendarId: { type: SimpleSchema.RegEx.Id, optional: true },
      scheduleId: { type: SimpleSchema.RegEx.Id, optional: true },
      weekday: { type: String, optional: true, allowedValues: weekdays },
      newSchedule: { type: FromTo, optional: true }
    }).validator(),

    run ({ calendarId, userId, scheduleId, weekday, newSchedule }) {
      if (this.connection && !this.userId ||
        !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (scheduleId) {
        const existingSchedule = Schedules.findOne({
          type: 'default',
          _id: scheduleId
        })

        if (!existingSchedule) {
          throw new Meteor.Error(404, 'Schedule not found')
        }

        if (!newSchedule) {
          Schedules.softRemove({ _id: scheduleId })
          Events.post('schedules/softRemoveDefaultSchedule', {
            scheduleId: scheduleId,
            userId: this.userId
          })
          return scheduleId
        }

        Schedules.update({ _id: scheduleId }, {
          $set: {
            from: newSchedule.from,
            to: newSchedule.to
          }
        })

        Events.post('schedules/updateDefaultSchedule', {
          scheduleId: scheduleId,
          userId: this.userId
        })
        return scheduleId
      } else {
        if (userId && calendarId && weekday && newSchedule) {
          const newScheduleId = Schedules.insert({
            type: 'default',
            userId,
            calendarId,
            weekday,
            from: newSchedule.from,
            to: newSchedule.to,
            available: true,
            createdAt: new Date(),
            createdBy: this.userId
          })

          Events.post('schedules/insertDefaultSchedule', {
            scheduleId: newScheduleId,
            userId: this.userId
          })
          return newScheduleId
        } else {
          throw new Meteor.Error(400, 'Missing arguments')
        }
      }
    }
  })
}
