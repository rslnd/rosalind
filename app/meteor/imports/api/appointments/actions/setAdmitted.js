import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'

export const setAdmitted = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setAdmitted',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      waitlistAssigneeId: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run({ appointmentId, waitlistAssigneeId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).admitted) {
        console.warn('[Appointments] setAdmitted: Appointment is already set to admitted', { appointmentId })
        return
      }

      let $set = {
        admitted: true,
        admittedAt: new Date(),
        admittedBy: this.userId
      }

      if (waitlistAssigneeId) {
        $set.waitlistAssigneeId = waitlistAssigneeId
      }

      const $unset = {
        canceled: 1,
        canceledAt: 1,
        canceledBy: 1,
        noShow: 1,
        noShowAt: 1,
        treated: 1,
        treatmentStart: 1,
        treatmentEnd: 1
      }

      Appointments.update({ _id: appointmentId }, { $set, $unset })

      if (Meteor.isServer) {
        Referrals.serverActions.redeem({ appointmentId })
      }

      Events.post('appointments/setAdmitted', { appointmentId, waitlistAssigneeId })

      return appointmentId
    }
  })
}
