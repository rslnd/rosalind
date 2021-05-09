import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const unsetDismissed = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetDismissed',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).queued) {
        console.warn('[Appointments] unsetDismissed: Appointment is already set to admitted', { appointmentId })
        return
      }

      const $unset = {
        dismissed: 1,
        dismissedAt: 1,
        dismissedBy: 1,
        queued: 1,
        queuedAt: 1,
        queuedBy: 1,
        admitted: 1,
        admittedAt: 1,
        admittedBy: 1,
        treated: 1,
        treatmentStart: 1,
        treatmentEnd: 1
      }

      Appointments.update({ _id: appointmentId }, { $unset })

      Events.post('appointments/unsetDismissed', { appointmentId })

      return appointmentId
    }
  })
}
