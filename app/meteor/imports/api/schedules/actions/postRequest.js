import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'

export const postRequest = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/postRequest',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      start: { type: Date },
      end: { type: Date },
      note: { type: String, optional: true },
      reason: { type: String,
        allowedValues: [
          'vacation',
          'compensatory',
          'sick'
        ] }
    }).validator(),

    run ({ start, end, note, reason }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      let schedule = { start, end, note, reason }
      schedule.valid = false
      schedule.userId = this.userId
      schedule.requestedBy = this.userId
      schedule.requestedAt = new Date()
      schedule.resolvedBy = null
      schedule.resolvedAt = null
      schedule.type = 'override'

      const scheduleId = Schedules.insert(schedule, (err) => {
        if (err) { throw err }
        Events.post('schedules/postRequest', { scheduleId })
      })
      return scheduleId
    }
  })
}
