import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const sendReminders = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/sendReminders',
    mixins: [CallPromiseMixin],
    validate () { return true },
    run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      throw new Meteor.Error(500, 'Not Implemented')
    }
  })
}
