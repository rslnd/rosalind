import { Meteor } from 'meteor/meteor'
import { sendEmail as performSendEmail } from '../methods/sendEmail'
import { action, Match } from '../../../../util/meteor/action'

export const sendEmail = action({
  name: 'reports/sendEmail',
  roles: ['reports', 'admin'],
  args: {
    day: Match.Maybe({
      day: Number,
      month: Number,
      year: Number
    }),
    to: Match.Maybe(String)
  },
  fn (args = {}) {
    if (!this.userId) {
      throw new Meteor.Error(403, 'Not authorized')
    }

    if (this.isSimulation) {
      return
    }

    return performSendEmail(args)
  }
})
