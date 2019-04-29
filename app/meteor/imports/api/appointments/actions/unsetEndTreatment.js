import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const unsetEndTreatment = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetEndTreatment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const appointment = Appointments.findOne({ _id: appointmentId })
      if (!appointment) {
        throw new Meteor.Error(404, 'Not found')
      }

      if (!appointment.treatmentEnd) {
        console.warn('[Appointments] unsetEndTreatment: Appointment has not started treatment', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $unset: {
          treated: 1,
          treatmentEnd: 1
        }
      })

      Events.post('appointments/unsetEndTreatment', { appointmentId })

      return appointmentId
    }
  })
}
