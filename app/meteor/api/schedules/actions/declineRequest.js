import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const declineRequest = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/declineRequest',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      scheduleId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ scheduleId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Schedules.update({ _id: scheduleId }, {
        $set: {
          valid: false,
          resolvedAt: new Date(),
          resolvedBy: this.userId,
          declinedAt: new Date(),
          declinedBy: this.userId
        }
      }, (err) => {
        if (err) { throw err }
        Events.post('schedules/declineRequest', { scheduleId })
      })

      return scheduleId
    }
  })
}
