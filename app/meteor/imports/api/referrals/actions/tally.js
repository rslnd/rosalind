import identity from 'lodash/identity'
import uniq from 'lodash/uniq'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Appointments } from '../../appointments'

export const tally = ({ Referrals, Referrables }) => {
  return new ValidatedMethod({
    name: 'referrals/tally',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      date: { type: Date }, // tally [today's] referrals separately
      from: { type: Date, optional: true },
      to: { type: Date, optional: true },
      referredBy: { type: SimpleSchema.RegEx.Id, optional: true },
      redeemImmediately: { type: Boolean, optional: true }
    }).validator(),

    async run({ date, from, to, referredBy, redeemImmediately }) {
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
        if (!this.userId && this.connection && !isTrustedNetwork(this.connection.clientAddress)) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      } else {
        // Skip simulation
        return
      }

      const referrables = await Referrables.find({ redeemImmediately }).fetchAsync()

      const selector = {
        type: { $ne: 'external' },
        referrableId: { $in: referrables.map(r => r._id) }
      }

      if (referredBy) {
        selector.referredBy = referredBy
      }

      const referrals = await Referrals.find(selector).fetchAsync()

      const patientIds = uniq(referrals.map(r => r.patientId).filter(identity))
      const futureAppointments = await Appointments.find({
        patientId: { $in: patientIds },
        start: { $gte: new Date() },
        canceled: { $ne: true }
      }).fetchAsync()

      return Referrals.methods.tally({
        date,
        from,
        to,
        referrals,
        futureAppointments
      })
    }
  })
}
