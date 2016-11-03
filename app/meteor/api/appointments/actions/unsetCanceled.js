import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const unsetCanceled = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetCanceled',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Appointments.findOne({ _id: appointmentId }).canceled) {
        console.warn('[Appointments] unsetCanceled: Appointment is already not canceled', { appointmentId })
        return
      }

      Appointments.update({ _id: appointmentId }, {
        $unset: {
          canceled: null,
          canceledAt: null,
          canceledBy: null
        }
      })

      Events.post('appointments/unsetCanceled', { appointmentId })

      return appointmentId
    }
  })
}
