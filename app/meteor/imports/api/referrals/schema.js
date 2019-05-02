import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

// TODO: Add fromTagId, fromUserId [assignee/waitlistAssignee], byUserId [loggen in user]
export const referrables = new SimpleSchema({
  order: {
    type: Number
  },

  name: {
    type: String
  },

  icon: {
    type: String,
    optional: true
  },

  fromCalendarIds: {
    type: [SimpleSchema.RegEx.Id]
  },

  toCalendarId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  toTagId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  redeemImmediately: {
    type: Boolean
  },

  max: {
    type: Number,
    optional: true
  }
})

export const referrals = new SimpleSchema({
  type: {
    type: String,
    optional: true,
    allowedValues: ['external']
  },

  referrableId: {
    type: SimpleSchema.RegEx.Id
  },

  patientId: {
    type: SimpleSchema.RegEx.Id
  },

  referredBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  referredTo: {
    type: SimpleSchema.RegEx.Id,
    optional: true
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

  redeemedImmediately: {
    type: Boolean,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt
  }
})
