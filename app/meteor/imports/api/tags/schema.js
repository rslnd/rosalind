import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export default new SimpleSchema({
  tag: {
    type: String,
    index: 1
  },

  synonyms: {
    type: [String],
    optional: true
  },

  order: {
    type: Number,
    optional: true
  },

  duration: {
    type: Number,
    optional: true
  },

  description: {
    type: String,
    optional: true
  },

  color: {
    type: String,
    optional: true
  },

  privateAppointment: {
    type: Boolean,
    optional: true
  },

  defaultRevenue: {
    type: Number,
    optional: true
  },

  minRevenue: {
    type: Number,
    optional: true
  },

  maxRevenue: {
    type: Number,
    optional: true
  },

  calendarIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true
  },

  assigneeIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true
  },

  blacklistAssigneeIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true
  },

  reportAs: {
    type: String,
    optional: true
  },

  reportHeader: {
    type: String,
    optional: true
  },

  referrableFrom: {
    type: [SimpleSchema.RegEx.Id],
    optional: true
  },

  maxParallel: {
    type: Number,
    optional: true
  },

  isConsentRequired: {
    type: Boolean,
    optional: true
  },

  consentTemplateId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  noSmsAppointmentReminder: {
    type: Boolean,
    optional: true
  },

  external: {
    type: [ String ],
    optional: true,
    index: 1
  },

  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: Auto.createdBy,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    index: 1,
    optional: true
  }
})
