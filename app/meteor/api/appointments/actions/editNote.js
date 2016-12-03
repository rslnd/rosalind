import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const editNote = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/editNote',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      newNote: { type: String, optional: true }
    }).validator(),

    run ({ appointmentId, newNote }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointment = Appointments.findOne({ _id: appointmentId })

      if (appointment) {
        Appointments.update({ _id: appointmentId }, {
          $set: {
            note: newNote
          }
        })

        Events.post('appointments/editNote', {
          appointmentId,
          oldNote: appointment.note,
          newNote
        })
      } else {
        throw new Meteor.Error(404, 'Appointment not found')
      }

      return appointmentId
    }
  })
}
