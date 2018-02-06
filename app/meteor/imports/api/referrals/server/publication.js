import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Referrals } from '../'

export const publication = () => {
  Meteor.publish('referrals', function (args) {
    check(args, {
      patientIds: [String]
    })

    if (this.userId) {
      return Referrals.find({
        patientId: {
          $in: args.patientIds
        }
      })
    }
  })
}
