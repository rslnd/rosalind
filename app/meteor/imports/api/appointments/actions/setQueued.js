import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const setQueued = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setQueued',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).queued) {
        console.warn('[Appointments] setQueued: Appointment is already set to admitted', { appointmentId })
        return
      }

      let $set = {
        queued: true,
        queuedAt: new Date(),
        queuedBy: this.userId
      }

      const $unset = {
        canceled: 1,
        canceledAt: 1,
        canceledBy: 1,
        admitted: 1,
        admittedAt: 1,
        admittedBy: 1,
        noShow: 1,
        noShowAt: 1,
        treated: 1,
        treatmentStart: 1,
        treatmentEnd: 1
      }

      Appointments.update({ _id: appointmentId }, { $set, $unset })

      Events.post('appointments/setQueued', { appointmentId })

      return appointmentId
    }
  })
}
