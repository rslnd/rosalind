import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'

export const applyDefaultSchedule = ({ Schedules, Users }) => {
  return new ValidatedMethod({
    name: 'schedules/applyDefaultSchedule',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      from: { type: Date },
      to: { type: Date }
    }).validator(),

    run ({ calendarId, from, to }) {
      if (this.connection && !this.userId ||
        !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (to < from) {
        throw new Meteor.Error(400, 'Swap to and from dates')
      }

      if (to <= new Date() || from <= new Date()) {
        throw new Meteor.Error(400, 'Dates must be in the future')
      }

      Events.post('schedules/applyDefaultSchedule', {
        calendarId,
        from,
        to,
        userId: this.userId
      })

      return true
    }
  })
}
