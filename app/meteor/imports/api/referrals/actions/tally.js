import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const tally = ({ Referrals }) => {
  return new ValidatedMethod({
    name: 'referrals/tally',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      date: { type: Date }
    }).validator(),

    run ({ date }) {
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/server/isTrustedNetwork')
        if (!this.userId || (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      } else {
        if (!this.userId) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      }

      const referrals = Referrals.find({}).fetch()

      return Referrals.methods.tally({
        date,
        referrals
      })
    }
  })
}
