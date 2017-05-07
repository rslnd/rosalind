import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'
import { getDefaultLength } from '../methods/getDefaultLength'

export const acquireLock = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/acquireLock',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      time: { type: Date },
      assigneeId: { type: String, optional: true }
    }).validator(),

    run ({ assigneeId, time }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const length = getDefaultLength({ assigneeId, date: moment(time) })

      const appointmentId = Appointments.insert({
        start: time,
        end: moment(time).add(length, 'minutes').toDate(),
        assigneeId,
        lockedAt: new Date(),
        lockedBy: this.userId
      })

      Events.post('appointments/acquireLock', { appointmentId })

      return appointmentId
    }
  })
}
