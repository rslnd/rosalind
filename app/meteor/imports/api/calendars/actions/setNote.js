import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Roles } from 'meteor/alanning:roles'
import { Calendars } from '../../'

export const setNote = () => {
  return new ValidatedMethod({
    name: 'calendars/setNote',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      newNote: { type: String }
    }).validator(),

    run ({ calendarId, newNote }) {
      if (this.isSimulation) {
        return true
      }

      if (!this.userId || !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const calendar = Calendars.findOne({ _id: calendarId })

      if (!calendar) {
        throw new Meteor.Error(404, 'Calendar not found')
      }

      return Calendars.update({ _id: calendarId }, {
        $set: {
          note: newNote
        }
      })
    }
  })
}
