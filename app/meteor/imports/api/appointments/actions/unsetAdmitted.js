import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'

export const unsetAdmitted = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetAdmitted',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!(await Appointments.findOneAsync({ _id: appointmentId })).admitted) {
        console.warn('[Appointments] unsetAdmitted: Appointment is already not admitted', { appointmentId })
        return
      }

      await Appointments.updateAsync({ _id: appointmentId }, {
        $unset: {
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

      Events.post('appointments/unsetAdmitted', { appointmentId })

      return appointmentId
    }
  })
}
