import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'

export const unsetQueued = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetQueued',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Appointments.update({ _id: appointmentId }, {
        $unset: {
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
      })

      if (Meteor.isServer) {
        Referrals.serverActions.unredeem({ appointmentId })
      }

      Events.post('appointments/unsetQueued', { appointmentId })

      return appointmentId
    }
  })
}
