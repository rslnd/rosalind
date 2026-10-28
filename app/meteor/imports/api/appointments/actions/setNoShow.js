import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Messages } from '../../messages'
import { Referrals } from '../../referrals'

export const setNoShow = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/setNoShow',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if ((await Appointments.findOneAsync({ _id: appointmentId })).noShow) {
        console.log('[Appointments] setNoShow: Appointment is already set to no show', { appointmentId })
        await Messages.actions.removeReminder.callPromise({ appointmentId })
        return
      }

      await Appointments.updateAsync({ _id: appointmentId }, {
        $set: {
          noShow: true,
          noShowAt: new Date()
        },
        $unset: {
          dismissed: 1,
          dismissedBy: 1,
          dismissedAt: 1,  
          admitted: 1,
          admittedAt: 1,
          admittedBy: 1,
          treated: 1,
          treatmentBy: 1,
          treatmentStart: 1,
          treatmentEnd: 1
        }
      })

      if (Meteor.isServer) {
        await Messages.actions.removeReminder.callPromise({ appointmentId })
        await Referrals.serverActions.unredeem({ appointmentId })
      }

      Events.post('appointments/setNoShow', { appointmentId })

      return appointmentId
    }
  })
}
