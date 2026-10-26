import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
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

    async run({ appointmentId, canceledByMessageId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if ((await Appointments.findOneAsync({ _id: appointmentId })).canceled) {
        console.log('[Appointments] setCanceled: Appointment is already set to canceled', { appointmentId })
        await Messages.actions.removeReminder.callPromise({ appointmentId })
        return
      }

      await Appointments.updateAsync({ _id: appointmentId }, {
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
        await Messages.actions.removeReminder.callPromise({ appointmentId })
        Referrals.serverActions.unredeem({ appointmentId })
      }

      Events.post('appointments/setCanceled', { appointmentId })

      return appointmentId
    }
  })
}
