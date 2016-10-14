import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const setCanceled = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setCanceled',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).canceled) {
        console.warn('[Appointments] setCanceled: Appointment is already set to canceled', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          admitted: false,
          canceled: true,
          canceledAt: new Date(),
          canceledBy: this.userId
        }
      })

      Events.post('appointments/setCanceled', { appointmentId })

      return appointmentId
    }
  })
}
