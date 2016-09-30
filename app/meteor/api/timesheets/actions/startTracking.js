import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const startTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/startTracking',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run ({ userId }) {
      Timesheets.actions.isTracking.callPromise({ userId })
        .then((isTracking) => {
          if (!isTracking) {
            const timesheetId = Timesheets.insert({
              userId,
              start: new Date(),
              tracking: true
            })

            Events.post('timesheets/startTracking', { userId, timesheetId })
          }
        })
    }
  })
}
