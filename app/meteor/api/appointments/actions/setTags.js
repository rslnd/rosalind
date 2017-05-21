import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const setTags = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setTags',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      newTags: { type: [SimpleSchema.RegEx.Id], optional: true }
    }).validator(),

    run ({ appointmentId, newTags }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointment = Appointments.findOne({ _id: appointmentId })

      if (appointment) {
        Appointments.update({ _id: appointmentId }, {
          $set: {
            tags: newTags
          }
        })

        Events.post('appointments/setTags', {
          appointmentId,
          newTags
        })
      } else {
        throw new Meteor.Error(404, 'Appointment not found')
      }

      return appointmentId
    }
  })
}
