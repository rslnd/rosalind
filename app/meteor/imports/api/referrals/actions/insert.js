import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'

export const insert = ({ Referrals, Referrables }) => {
  return new ValidatedMethod({
    name: 'referrals/insert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patientId: { type: SimpleSchema.RegEx.Id },
      appointmentId: { type: SimpleSchema.RegEx.Id },
      referredTo: { type: SimpleSchema.RegEx.Id, optional: true },
      referrableId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run({ patientId, appointmentId, referredTo, referrableId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const referrable = Referrables.findOne({ _id: referrableId })
      if (!referrable) {
        throw new Error(`[Referrals] Unknown referrableId: ${referrableId}`)
      }

      if (referrable.max === 0) {
        throw new Error('[Referrals] Maximum referrable count is zero')
      }

      const existingReferrals = Referrals.find({ patientId, referredTo, referrableId })
      if (referrable.max >= 1 && existingReferrals.length >= referrable.max) {
        console.warn(`[Referrals] insert: Patient ${patientId} has already been referred to ${referredTo}`)
        return
      }

      const referral = {
        patientId,
        appointmentId,
        referredTo,
        referrableId,
        referredBy: this.userId,
        referringAppointmentId: appointmentId,
        createdAt: new Date()
      }

      const referralId = referrable.redeemImmediately
        ? Referrals.insert({
          ...referral,
          redeemedImmediately: true,
          redeemedAt: new Date(),
          redeemingAppointmentId: null
        })
        : Referrals.insert({ ...referral })

      Events.post('referrals/insert', { referralId })

      return appointmentId
    }
  })
}
