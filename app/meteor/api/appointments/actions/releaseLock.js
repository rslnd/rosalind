import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const releaseLock = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/releaseLock',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      time: { type: Date, optional: true },
      assigneeId: { type: String, optional: true }
    }).validator(),

    run ({ assigneeId, time }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      let selector = {
        lockedAt: { $ne: null },
        lockedBy: this.userId,
        assigneeId
      }

      if (time) {
        selector.start = time
      }

      const locks = Appointments.find(seletor).fetch().map((lock) => {
        Appointments.remove({ _id: lock._id })
        return lock._id
      })

      if (locks.length === 1) {
        Events.post('appointments/releaseLock', { appointmentId: locks[0] })
        return locks[0]
      } else if (locks.length > 1) {
        Events.post('appointments/releaseLock', { appointmentIds: locks })
        return locks
      }
    }
  })
}
