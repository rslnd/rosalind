import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const acquireLock = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/acquireLock',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      start: { type: Date },
      end: { type: Date },
      assigneeId: { type: String, optional: true }
    }).validator(),

    run ({ calendarId, assigneeId, start, end }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointmentId = Appointments.insert({
        calendarId,
        start,
        end,
        assigneeId,
        type: 'lock',
        lockedAt: new Date(),
        lockedBy: this.userId
      })

      Events.post('appointments/acquireLock', { appointmentId })

      return appointmentId
    }
  })
}
