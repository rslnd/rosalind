import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'

export const endTreatment = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/endTreatment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if ((await Appointments.findOneAsync({ _id: appointmentId })).treatmentEnd) {
        console.warn('[Appointments] endTreatment: Appointment has already set treatmentEnd', { appointmentId })
        return
      }

      await Appointments.updateAsync({ _id: appointmentId }, {
        $set: {
          treatmentEnd: new Date(),
          treatmentBy: this.userId,
          treated: true
        }
      })

      if (Meteor.isServer) {
        Referrals.serverActions.redeem({ appointmentId })
      }

      Events.post('appointments/endTreatment', { appointmentId })

      return appointmentId
    }
  })
}
