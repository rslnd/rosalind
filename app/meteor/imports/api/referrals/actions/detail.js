import { Roles } from 'meteor/alanning:roles'
import identity from 'lodash/identity'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'

export const detail = ({ Referrals, Referrables }) => {
  return new ValidatedMethod({
    name: 'referrals/detail',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      from: { type: Date, optional: true },
      to: { type: Date, optional: true },
      referredBy: { type: SimpleSchema.RegEx.Id, optional: true },
      redeemImmediately: { type: Boolean, optional: true }
    }).validator(),

    run({ from, to, referredBy, redeemImmediately }) {
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/server/isTrustedNetwork')
        if (!this.userId && this.connection && !isTrustedNetwork(this.connection.clientAddress)) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      } else {
        // Skip simulation
        return
      }

      if (!Roles.userIsInRole(this.userId, ['admin', 'reports'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const referrables = Referrables.find({
        redeemImmediately
      }).fetch()
      console.log('referrables', { redeemImmediately }, referrables.map(r => r.name))

      const selector = {
        type: { $ne: 'external' },
        referredBy,
        referrableId: { $in: referrables.map(r => r._id) },
        $or: [
          { createdAt: { $gte: from, $lte: to } },
          { redeemedAt: { $gte: from, $lte: to } }
        ]
      }

      const isInRange = ({ from, to }) => date =>
        date && (from <= date && date <= to)

      const referrals = Referrals.find(selector).fetch().map(r => {
        const redeemedInPeriod = isInRange({ from, to })(r.redeemedAt)

        if (!redeemedInPeriod) {
          delete r.redeemedAt
        }

        return {
          ...r,
          redeemedInPeriod
        }
      })

      const patientIds = referrals.map(r => r.patientId)

      const futureAppointments = Appointments.find({
        patientId: { $in: patientIds },
        start: { $gte: new Date() },
        canceled: { $ne: true }
      }).fetch()

      const redeemingAppointmentIds = referrals
        .map(r => r.redeemingAppointmentId).filter(identity)
      const redeemingAppointments = Appointments.find({
        _id: { $in: redeemingAppointmentIds }
      }).fetch()

      const patients = Patients.find({
        _id: { $in: patientIds }
      }, {
          removed: true,
          fields: Patients.fields.preload
        }).fetch()

      return Referrals.methods.detail({
        from,
        to,
        referrals,
        redeemingAppointments,
        futureAppointments,
        patients
      })
    }
  })
}
