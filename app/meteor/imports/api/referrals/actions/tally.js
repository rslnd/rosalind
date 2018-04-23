import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const tally = ({ Referrals }) => {
  return new ValidatedMethod({
    name: 'referrals/tally',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      date: { type: Date }, // tally [today's] referrals separately
      from: { type: Date, optional: true },
      to: { type: Date, optional: true },
      referredBy: { type: SimpleSchema.RegEx.Id, optional: true }
    }).validator(),

    run ({ date, from, to, referredBy }) {
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/server/isTrustedNetwork')
        if (!this.userId && this.connection && !isTrustedNetwork(this.connection.clientAddress)) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      } else {
        // Skip simulation
        return
      }

      const selector = referredBy ? { referredBy } : {}
      const referrals = Referrals.find(selector).fetch()

      return Referrals.methods.tally({
        date,
        from,
        to,
        referrals
      })
    }
  })
}
