import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Events } from '../../events'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

export const startTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/startTracking',
    mixins: [CallPromiseMixin],
    validate () {},
    // Awaited throughout: a nested method call started from inside a stub and
    // left unawaited corrupts DDP._CurrentMethodInvocation, wedging the client
    // into a permanent simulation where no method reaches the server again.
    async run () {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const userId = this.userId
      const isTracking = await Timesheets.actions.isTracking.callPromise({ userId })

      if (!isTracking) {
        const timesheetId = await Timesheets.insertAsync({
          userId,
          start: new Date(),
          tracking: true
        })

        Events.post('timesheets/startTracking', { userId, timesheetId })
      }
    }
  })
}
