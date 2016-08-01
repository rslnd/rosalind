import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const stopTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/stopTracking',

    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run ({ userId }) {
      const currentTimesheet = Timesheets.methods.isTracking.call({ userId })

      if (currentTimesheet) {
        Timesheets.update({ _id: currentTimesheet._id }, { $set: {
          end: new Date(),
          tracking: false
        }})

        Events.post('timesheets/stopTracking', { userId, timesheetId: currentTimesheet._id })
      }
    }
  })
}
