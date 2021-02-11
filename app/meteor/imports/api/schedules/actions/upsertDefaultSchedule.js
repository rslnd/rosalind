import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { weekdays } from '../../../util/time/weekdays'
import { HM } from '../../../util/schema'
import { hasRole } from '../../../util/meteor/hasRole'

const Schedule = new SimpleSchema({
  from: { type: HM },
  to: { type: HM },
  note: { type: String, optional: true },
  roles: { type: [String], optional: true },
})

export const upsertDefaultSchedule = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/upsertDefaultSchedule',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id, optional: true },
      calendarId: { type: SimpleSchema.RegEx.Id, optional: true },
      scheduleId: { type: SimpleSchema.RegEx.Id, optional: true },
      weekday: { type: String, optional: true, allowedValues: weekdays },
      newSchedule: { type: Schedule, optional: true }
    }).validator(),

    run ({ calendarId, userId, scheduleId, weekday, newSchedule }) {
      if ((this.connection && !this.userId) ||
        !hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      console.log('XXX', newSchedule)

      const available = !(newSchedule && newSchedule.note)

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

        const modifier = {
          $set: {
            from: newSchedule.from,
            to: newSchedule.to,
            note: newSchedule.note,
            roles: newSchedule.roles,
            available
          }
        }

        if (newSchedule.note) {
          modifier.$set.note = newSchedule.note
        } else {
          modifier.$unset = {
            note: 1
          }
        }

        if (newSchedule.roles) {
          modifier.$set.roles = newSchedule.roles
        } else {
          modifier.$unset = {
            roles: 1
          }
        }

        Schedules.update({ _id: scheduleId }, modifier)

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
            note: newSchedule.note,
            roles: newSchedule.roles,
            available,
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
