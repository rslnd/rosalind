import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Tags } from '../../tags'

export const update = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/update',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      update: {
        type: new SimpleSchema({
          revenue: { type: Number, decimal: true, optional: true },
          tags: { type: [SimpleSchema.RegEx.Id], optional: true },
          note: { type: String, optional: true }
        })
      }
    }).validator(),

    run({ appointmentId, update }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointment = Appointments.findOne({ _id: appointmentId }, { removed: true })

      if (appointment) {
        // TODO: Calendar flag for setting auto revenue calculation strategy
        if (update.tags && update.tags.length >= 1 && !update.revenue) {
          update.revenue = Math.max(...Tags.methods.expand(update.tags).map(t => t.defaultRevenue))
        }

        Appointments.update({ _id: appointmentId }, {
          $set: update
        })

        Events.post('appointments/update', { appointmentId })
      } else {
        throw new Meteor.Error(404, 'Appointment not found')
      }

      return appointmentId
    }
  })
}
