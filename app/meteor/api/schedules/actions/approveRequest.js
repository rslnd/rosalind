import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const approveRequest = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/approveRequest',
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
          valid: true,
          resolvedAt: new Date(),
          resolvedBy: this.userId,
          approvedAt: new Date(),
          approvedBy: this.userId
        }
      }, (err) => {
        if (err) { throw err }
        Events.post('schedules/approveRequest', { scheduleId })
      })

      return scheduleId
    }
  })
}
