import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const unsetConsented = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetConsented',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Appointments.findOne({ _id: appointmentId }).consentedAt) {
        console.warn('[Appointments] unsetConsented: Appointment has not set consentedAt', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $unset: {
          consentedAt: 1,
          consentedBy: 1
        }
      })

      Events.post('appointments/unsetConsented', { appointmentId })

      return appointmentId
    }
  })
}
