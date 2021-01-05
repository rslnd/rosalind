import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { agreements } from '../patients/schema'

export const schema = new SimpleSchema({
  order: {
    type: Number,
    optional: true
  },

  name: {
    type: String
  },

  color: {
    type: String
  },

  slug: {
    type: String
  },

  icon: {
    type: String
  },

  defaultDuration: {
    type: Number,
    defaultValue: 5
  },

  slotSize: {
    type: Number,
    defaultValue: 5
  },

  atMinutes: {
    type: [Number],
    optional: true
  },

  allowUnassigned: {
    type: Boolean,
    defaultValue: true
  },

  unassignedLabel: {
    type: String,
    optional: true
  },

  privateAppointments: {
    type: Boolean,
    optional: true
  },

  reportAs: {
    type: String,
    optional: true
  },

  reportAddenda: {
    type: [String],
    optional: true
  },

  admittedIsTreated: {
    type: Boolean,
    optional: true
  },

  showTagNames: {
    type: Boolean,
    optional: true
  },

  allowEditTagsWhenUnavailable: {
    type: Boolean,
    optional: true
  },

  note: {
    type: String,
    optional: true
  },

  smsAppointmentReminder: {
    type: Boolean,
    optional: true
  },

  smsAppointmentReminderText: {
    type: String,
    optional: true
  },

  smsAppointmentReminderCancelationConfirmationText: {
    type: String,
    optional: true
  },

  assigneeName: {
    type: String,
    optional: true
  },

  assigneeNamePlural: {
    type: String,
    optional: true
  },

  patientName: {
    type: String,
    optional: true
  },

  patientNamePlural: {
    type: String,
    optional: true
  },

  referrableFrom: {
    type: [SimpleSchema.RegEx.Id],
    optional: true
  },

  requirePhone: {
    type: Boolean,
    optional: true
  },

  consentRequired: {
    type: Boolean,
    optional: true
  },

  requiredAgreements: {
    type: [String],
    allowedValues: agreements,
    optional: true
  },

  history: {
    type: Boolean,
    optional: true
  },

  allowMoveBetweenAssignees: {
    type: Boolean,
    optional: true
  },

  allowBanningPatients: {
    type: Boolean,
    optional: true
  }
})
