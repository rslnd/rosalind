import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
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

    async run ({ calendarId, assigneeId, start, end }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointmentId = await Appointments.insertAsync({
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
