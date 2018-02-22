import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const schema = new SimpleSchema({
  patientId: {
    type: SimpleSchema.RegEx.Id
  },

  referredBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  referredTo: {
    type: SimpleSchema.RegEx.Id
  },

  referringAppointmentId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  redeemedAt: {
    type: Date,
    optional: true
  },

  redeemingAppointmentId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt
  }
})
