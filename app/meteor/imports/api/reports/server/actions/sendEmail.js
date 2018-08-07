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

    return sendEmail(args)
  }
})
