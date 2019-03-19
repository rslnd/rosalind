import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'

export const insert = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/upsert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      schedule: { type: new SimpleSchema({
        type: { type: String, allowedValues: ['override'] },
        calendarId: { type: SimpleSchema.RegEx.Id },
        userId: { type: SimpleSchema.RegEx.Id },
        start: { type: Date },
        end: { type: Date },
        available: { type: Boolean }
      }) },
      quiet: { type: Boolean, optional: true }
    }).validator(),

    run ({ schedule, quiet }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (this.connection) {
        quiet = false
      }

      const scheduleId = Schedules.insert(schedule, (err, scheduleId) => {
        if (err) { throw err }
        if (!quiet) { Events.post('schedules/insert', { scheduleId }) }
      })

      return scheduleId
    }
  })
}
