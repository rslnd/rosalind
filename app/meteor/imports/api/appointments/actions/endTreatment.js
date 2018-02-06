import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const endTreatment = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/endTreatment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).treatmentEnd) {
        console.warn('[Appointments] endTreatment: Appointment has already set treatmentEnd', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          treatmentEnd: new Date(),
          treatmentBy: this.userId,
          treated: true
        }
      })

      Events.post('appointments/endTreatment', { appointmentId })

      return appointmentId
    }
  })
}
