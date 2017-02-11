import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'

// TODO: Figure out better way to import server-only modules in isomorphic code
let SMS
if (Meteor.isServer) {
  SMS = require('api/messages/channels/sms')
}

export const sendScheduled = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/sendScheduled',
    mixins: [CallPromiseMixin],
    validate () {},
    run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Meteor.isServer) { return }

      const timeWindow = {
        $gt: moment().subtract(6, 'hours').toDate(),
        $lt: moment().toDate()
      }

      const scheduledMessages = Messages.find({
        status: 'scheduled',
        direction: 'outbound',
        scheduled: timeWindow
      }).fetch()

      scheduledMessages.map((message) => {
        switch (message.channel) {
          case 'SMS':
            return SMS.send(message)
          default:
            throw new Meteor.Error(500, `[Messages] sendScheduled: Unknown channel ${message.channel} of message ${message._id}`)
        }
      })

      return Promise.all(scheduledMessages)
    }
  })
}
