import SimpleSchema from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export default new SimpleSchema({
  tag: {
    type: String,
    index: 1
  },

  shortTag: {
    type: String,
    optional: true
  },

  synonyms: {
    type: Array,
    optional: true
  },
  'synonyms.$': { type: String },

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

  textColor: {
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
    type: Array,
    optional: true
  },
  'calendarIds.$': { type: SimpleSchema.RegEx.Id },

  assigneeIds: {
    type: Array,
    optional: true
  },
  'assigneeIds.$': { type: SimpleSchema.RegEx.Id },

  blacklistAssigneeIds: {
    type: Array,
    optional: true
  },
  'blacklistAssigneeIds.$': { type: SimpleSchema.RegEx.Id },

  reportAs: {
    type: String,
    optional: true
  },

  reportHeader: {
    type: String,
    optional: true
  },

  referrableFrom: {
    type: Array,
    optional: true
  },
  'referrableFrom.$': { type: SimpleSchema.RegEx.Id },

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
    type: Array,
    optional: true,
    index: 1
  },
  'external.$': { type: String },

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
