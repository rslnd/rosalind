import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
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

    run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).noShow) {
        console.log('[Appointments] setNoShow: Appointment is already set to no show', { appointmentId })
        Messages.actions.removeReminder.call({ appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          noShow: true,
          noShowAt: new Date()
        },
        $unset: {
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
        Messages.actions.removeReminder.call({ appointmentId })
        Referrals.serverActions.unredeem({ appointmentId })
      }

      Events.post('appointments/setNoShow', { appointmentId })

      return appointmentId
    }
  })
}
