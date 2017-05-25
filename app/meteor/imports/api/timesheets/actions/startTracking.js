import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Events } from '../../events'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const startTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/startTracking',
    mixins: [CallPromiseMixin],
    validate () {},
    run () {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const userId = this.userId
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
