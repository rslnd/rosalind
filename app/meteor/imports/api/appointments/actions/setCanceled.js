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
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).canceled) {
        console.log('[Appointments] setCanceled: Appointment is already set to canceled', { appointmentId })

        if (Meteor.isServer) {
          Messages.actions.removeReminder.call({ appointmentId })
        }

        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          canceled: true,
          canceledAt: new Date(),
          canceledBy: this.userId
        },
        $unset: {
          admitted: 1,
          admittedAt: 1,
          admittedBy: 1
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
