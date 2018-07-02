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
      calendarId: { type: SimpleSchema.RegEx.Id },
      day: { type: Day },
      note: { type: String, optional: true },
      noteDetails: { type: String, optional: true }
    }).validator(),

    run ({ calendarId, day, note, noteDetails }) {
      console.log({ calendarId, day, note, noteDetails })

      if (this.connection && !this.userId ||
        !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const existingSchedule = Schedules.findOne({
        type: 'day',
        calendarId,
        'day.year': day.year,
        'day.month': day.month,
        'day.day': day.day
      })

      if (existingSchedule) {
        Schedules.update({ _id: existingSchedule._id }, {
          $set: {
            note,
            noteDetails
          }
        })

        Events.post('schedules/setNoteUpdate', { scheduleId: existingSchedule._id })
        return existingSchedule._id
      } else {
        const schedule = {
          type: 'day',
          userIds: [],
          calendarId,
          day,
          note,
          noteDetails
        }

        const scheduleId = Schedules.insert(schedule, (err) => {
          if (err) { throw err }
          Events.post('schedules/setNoteInsert', { scheduleId })
        })
        return scheduleId
      }
    }
  })
}
