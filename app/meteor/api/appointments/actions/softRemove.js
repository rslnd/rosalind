import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

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
          removed: false,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      Events.post('appointments/softRemove', { appointmentId })

      return appointmentId
    }
  })
}
