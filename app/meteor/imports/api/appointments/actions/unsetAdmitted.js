import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const unsetAdmitted = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetAdmitted',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Appointments.findOne({ _id: appointmentId }).admitted) {
        console.warn('[Appointments] unsetAdmitted: Appointment is already not admitted', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          admitted: null,
          admittedAt: null,
          admittedBy: null
        }
      })

      Events.post('appointments/unsetAdmitted', { appointmentId })

      return appointmentId
    }
  })
}
