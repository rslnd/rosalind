import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const acquireLock = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/acquireLock',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      time: { type: Date },
      assigneeId: { type: String, optional: true }
    }).validator(),

    run ({ assigneeId, time }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointmentId = Appointments.insert({
        start: time,
        end: moment(time).add(5, 'minutes').toDate(),
        assigneeId,
        lockedAt: new Date(),
        lockedBy: this.userId
      })

      Events.post('appointments/acquireLock', { appointmentId })

      return appointmentId
    }
  })
}
