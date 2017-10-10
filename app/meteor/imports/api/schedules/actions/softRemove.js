import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const softRemove = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/softRemove',
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
          removed: true,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      Events.post('schedules/softRemove', { scheduleId })

      return scheduleId
    }
  })
}
