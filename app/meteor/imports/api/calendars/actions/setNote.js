import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { hasRole } from '../../../util/meteor/hasRole'

export const setNote = ({ Calendars }) => {
  return new ValidatedMethod({
    name: 'calendars/setNote',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      newNote: { type: String, optional: true }
    }).validator(),

    async run ({ calendarId, newNote }) {
      if (this.isSimulation) {
        return true
      }

      if (!this.userId || !await hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const calendar = await Calendars.findOneAsync({ _id: calendarId })

      if (!calendar) {
        throw new Meteor.Error(404, 'Calendar not found')
      }

      Events.post('calendars/setNote', { calendarId, newNote })

      return await Calendars.updateAsync({ _id: calendarId }, {
        $set: {
          note: newNote
        }
      })
    }
  })
}
