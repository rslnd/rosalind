import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const nextTreatment = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/nextTreatment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (Appointments.findOne({ _id: appointmentId }).treatmentEnd) {
        console.warn('[Appointments] nextTreatment: Appointment has already set treatmentEnd', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $set: {
          treatmentEnd: new Date(),
          treatmentBy: this.userId,
          treated: true
        }
      })

      const waitlistSelector = {
        assigneeId: this.userId,
        admittedAt: { $ne: null },
        treatmentEnd: null,
        start: {
          $gt: moment().startOf('day').toDate(),
          $lt: moment().endOf('day').toDate()
        }
      }

      const nextAppointments = Appointments.find(waitlistSelector, {
        sort: { admittedAt: 1 },
        limit: 1
      }).fetch()

      if (nextAppointments[0]) {
        Appointments.update({ _id: nextAppointments[0]._id }, {
          $set: {
            treatmentStart: new Date(),
            treatmentBy: this.userId
          }
        })
      }

      Events.post('appointments/nextTreatment', { appointmentId })

      return appointmentId
    }
  })
}
