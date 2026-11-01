import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
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

    async run({ patientId, appointmentId, referredTo, referrableId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const referrable = await Referrables.findOneAsync({ _id: referrableId })
      if (!referrable) {
        throw new Error(`[Referrals] Unknown referrableId: ${referrableId}`)
      }

      if (referrable.max === 0) {
        throw new Error('[Referrals] Maximum referrable count is zero')
      }

      const existingReferrals = await Referrals.find({ patientId, referredTo, referrableId }).fetchAsync()
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
        ? await Referrals.insertAsync({
          ...referral,
          redeemedImmediately: true,
          redeemedAt: new Date(),
          redeemingAppointmentId: null
        })
        : await Referrals.insertAsync({ ...referral })

      Events.post('referrals/insert', { referralId })

      return appointmentId
    }
  })
}
