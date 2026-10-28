import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'

export const stopTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/stopTracking',
    mixins: [CallPromiseMixin],
    validate () {},
    // Awaited throughout: a nested method call started from inside a stub and
    // left unawaited corrupts DDP._CurrentMethodInvocation, wedging the client
    // into a permanent simulation where no method reaches the server again.
    async run () {
      const userId = this.userId
      if (this.connection && !userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const currentTimesheet = await Timesheets.actions.isTracking.callPromise({ userId })

      if (currentTimesheet) {
        await Timesheets.updateAsync({ _id: currentTimesheet._id }, {
          $set: {
            end: new Date(),
            tracking: false
          }
        })

        Events.post('timesheets/stopTracking', { userId, timesheetId: currentTimesheet._id })
      }
    }
  })
}
