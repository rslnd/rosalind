import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const stopTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/stopTracking',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run ({ userId }) {
      Timesheets.actions.isTracking.callPromise({ userId })
        .then((currentTimesheet) => {
          if (currentTimesheet) {
            Timesheets.update({ _id: currentTimesheet._id }, { $set: {
              end: new Date(),
              tracking: false
            }})

            Events.post('timesheets/stopTracking', { userId, timesheetId: currentTimesheet._id })
          }
        })
    }
  })
}
