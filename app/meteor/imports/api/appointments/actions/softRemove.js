import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'
import { Messages } from '../../messages'

export const softRemove = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/softRemove',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          removed: true,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      if (Meteor.isServer) {
        Referrals.serverActions.unredeem({ appointmentId })
        Messages.actions.removeReminder.call({ appointmentId })
      }

      Events.post('appointments/softRemove', { appointmentId })

      return appointmentId
    }
  })
}
