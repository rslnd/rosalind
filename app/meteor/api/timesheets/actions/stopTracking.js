import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

export const stopTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/stopTracking',
    mixins: [CallPromiseMixin],
    validate () {},
    run () {
      const userId = this.userId
      if (this.connection && !userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

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
