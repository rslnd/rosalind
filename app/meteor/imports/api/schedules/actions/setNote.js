import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Day } from '../../../util/schema/day'
import { Events } from '../../events'

export const setNote = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/setNote',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id },
      day: { type: Day },
      note: { type: String, optional: true }
    }).validator(),

    run ({ day, userId, note }) {
      if (this.connection && !this.userId ||
        !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const existingSchedule = Schedules.findOne({ day, userId, type: 'note' })

      if (existingSchedule) {
        if (!note) {
          Events.post('schedules/setNoteRemove', { userId, day, oldNote: existingSchedule.note })
          Schedules.remove({ _id: existingSchedule._id })
        }

        Schedules.update({ _id: existingSchedule._id }, {
          $set: { note }
        })

        Events.post('schedules/setNoteUpdate', { scheduleId: existingSchedule._id, userId, day, note })
        return existingSchedule._id
      } else {
        const schedule = {
          type: 'note',
          userId,
          day,
          note
        }

        const scheduleId = Schedules.insert(schedule, (err) => {
          if (err) { throw err }
          Events.post('schedules/setNoteInsert', { scheduleId, userId, note, day })
        })
        return scheduleId
      }
    }
  })
}
