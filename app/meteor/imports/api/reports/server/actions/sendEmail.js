import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { sendEmail as performSendEmail } from '../methods/sendEmail'

export const sendEmail = new ValidatedMethod({
  name: 'reports/sendEmail',
  mixins: [CallPromiseMixin],
  validate () {},

  run (args = {}) {
    if (!this.userId) {
      throw new Meteor.Error(403, 'Not authorized')
    }

    if (this.isSimulation) {
      return
    }

    return performSendEmail(args)
  }
})
