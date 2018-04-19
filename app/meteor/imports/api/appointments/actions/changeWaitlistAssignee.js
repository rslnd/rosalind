import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const changeWaitlistAssignee = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/changeWaitlistAssignee',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      waitlistAssigneeId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ appointmentId, waitlistAssigneeId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Appointments.update({
        _id: appointmentId
      }, {
        $set: {
          waitlistAssigneeId
        },
        $unset: {
          treatmentStart: 1,
          treatmentBy: 1
        }
      })

      Events.post('appointments/changeWaitlistAssignee', {
        appointmentId,
        waitlistAssigneeId
      })

      return true
    }
  })
}
