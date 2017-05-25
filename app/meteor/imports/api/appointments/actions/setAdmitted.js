import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const setAdmitted = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setAdmitted',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).admitted) {
        console.warn('[Appointments] setAdmitted: Appointment is already set to admitted', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          canceled: false,
          admitted: true,
          admittedAt: new Date(),
          admittedBy: this.userId
        }
      })

      Events.post('appointments/setAdmitted', { appointmentId })

      return appointmentId
    }
  })
}
