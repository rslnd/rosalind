import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Referrals } from '../../referrals'

export const nextTreatment = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/nextTreatment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ appointmentId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if ((await Appointments.findOneAsync({ _id: appointmentId })).treatmentEnd) {
        console.warn('[Appointments] nextTreatment: Appointment has already set treatmentEnd', { appointmentId })
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
        await Referrals.serverActions.redeem({ appointmentId })
      }

      const waitlistSelector = {
        $or: [
          { assigneeId: this.userId },
          { waitlistAssigneeId: this.userId }
        ],
        admittedAt: { $ne: null },
        patientId: { $ne: null },
        removed: { $ne: true },
        treatmentEnd: null,
        start: {
          $gt: moment().startOf('day').toDate(),
          $lt: moment().endOf('day').toDate()
        }
      }

      const nextAppointments = await Appointments.find(waitlistSelector, {
        sort: { admittedAt: 1 },
        limit: 1
      }).fetchAsync()

      if (nextAppointments[0]) {
        await Appointments.updateAsync({ _id: nextAppointments[0]._id }, {
          $set: {
            treatmentStart: new Date(),
            treatmentBy: this.userId
          }
        })
      }

      Events.post('appointments/nextTreatment', {
        appointmentId,
        nextAppointmentId: nextAppointments[0] && nextAppointments[0]._id
      })

      return appointmentId
    }
  })
}
