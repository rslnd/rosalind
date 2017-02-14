import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'
import { Messages } from 'api/messages'

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

      Messages.actions.removeReminder.call({ appointmentId })

      Events.post('appointments/softRemove', { appointmentId })

      return appointmentId
    }
  })
}
