import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const removeReminder = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/removeReminder',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),
    run ({ appointmentId }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const removedCount = Messages.softRemove({
        type: 'appointmentReminder',
        status: 'scheduled',
        direction: 'outbound',
        'payload.appointmentId': appointmentId,
        removed: { $ne: true }
      })

      if (removedCount > 0) {
        console.log(`[Messages] removeReminder: Removed ${removedCount} scheduled reminder(s) for appointment ${appointmentId}`)
      }
    }
  })
}
