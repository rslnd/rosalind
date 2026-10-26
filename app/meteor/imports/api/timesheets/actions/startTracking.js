import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Events } from '../../events'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

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
        .then(async (isTracking) => {
          if (!isTracking) {
            const timesheetId = await Timesheets.insertAsync({
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
