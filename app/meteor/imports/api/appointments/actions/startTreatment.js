import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const startTreatment = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/startTreatment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).treatmentStart) {
        console.warn('[Appointments] startTreatment: Appointment has already set treatmentStart', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          treatmentStart: new Date(),
          treatmentBy: this.userId
        }
      })

      Events.post('appointments/startTreatment', { appointmentId })

      return appointmentId
    }
  })
}
