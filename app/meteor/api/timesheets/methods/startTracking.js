import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const startTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/startTracking',

    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run ({ userId }) {
      if (!Timesheets.methods.isTracking.call({ userId })) {
        const timesheetId = Timesheets.insert({
          userId,
          start: new Date(),
          tracking: true
        })

        Events.post('timesheets/startTracking', { userId, timesheetId })
      }
    }
  })
}
