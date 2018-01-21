import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const update = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/update',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      update: { type: Object, blackbox: true }
    }).validator(),

    run ({ appointmentId, update }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const updateWhitelist = ['revenue', 'tags', 'note']
      Object.keys(update).map(key => {
        if (updateWhitelist.indexOf(key) === -1) {
          console.error('[Appointments] update: Updating key not allowed', key)
          throw new Meteor.Error(403, 'Update not allowed')
        }
      })

      const appointment = Appointments.findOne({ _id: appointmentId })

      if (appointment) {
        Appointments.update({ _id: appointmentId }, {
          $set: update
        })

        Events.post('appointments/update', {
          appointmentId,
          update
        })
      } else {
        throw new Meteor.Error(404, 'Appointment not found')
      }

      return appointmentId
    }
  })
}
