import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Messages } from '../../messages'
import { Referrals } from '../../referrals'

export const setCanceled = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setCanceled',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      canceledByMessageId: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run({ appointmentId, canceledByMessageId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).canceled) {
        console.log('[Appointments] setCanceled: Appointment is already set to canceled', { appointmentId })
        Messages.actions.removeReminder.call({ appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          canceled: true,
          canceledAt: new Date(),
          canceledBy: this.userId,
          canceledByMessageId,
        },
        $unset: {
          dismissed: 1,
          dismissedBy: 1,
          dismissedAt: 1,  
          admitted: 1,
          admittedAt: 1,
          admittedBy: 1,
          noShow: 1,
          noShowAt: 1,
          treated: 1,
          treatmentStart: 1,
          treatmentEnd: 1
        }
      })

      if (Meteor.isServer) {
        Messages.actions.removeReminder.call({ appointmentId })
        Referrals.serverActions.unredeem({ appointmentId })
      }

      Events.post('appointments/setCanceled', { appointmentId })

      return appointmentId
    }
  })
}
