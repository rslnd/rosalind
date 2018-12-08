import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const setConsented = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setConsented',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      consentedAt: { type: Date, optional: true }
    }).validator(),

    run ({ appointmentId, consentedAt }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).consentedAt) {
        console.warn('[Appointments] setConsented: Appointment has already set consentedAt', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          consentedAt: consentedAt || new Date(),
          consentedBy: this.userId
        }
      })

      Events.post('appointments/setConsented', { appointmentId })

      return appointmentId
    }
  })
}
