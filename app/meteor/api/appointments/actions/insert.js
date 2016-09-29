import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const insert = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/insert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointment: { type: Object, blackbox: true }
    }).validator(),

    run ({ appointment }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointmentId = Appointments.insert(appointment, (err) => {
        if (err) {
          console.error('[Appointments] Insert failed with error', err, 'of appointment', appointment)
        } else {
          Events.post('appointments/insert', { appointmentId })
        }
      })

      return appointmentId
    }
  })
}
