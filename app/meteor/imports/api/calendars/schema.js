import SimpleSchema from 'meteor/aldeed:simple-schema'
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
    type: Array,
    optional: true
  },
  'atMinutes.$': { type: Number },

  allowUnassigned: {
    type: Boolean,
    defaultValue: true
  },

  unassignedLabel: {
    type: String,
    optional: true
  },

  unassignedAssigneeId: {
    type: SimpleSchema.RegEx.Id,
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
    type: Array,
    optional: true
  },
  'reportAddenda.$': { type: String },

  admittedIsTreated: {
    type: Boolean,
    optional: true
  },

  showTagNames: {
    type: Boolean,
    optional: true
  },

  showCounts: {
    type: Boolean,
    optional: true
  },

  allowEditTagsWhenUnavailable: {
    type: Boolean,
    optional: true
  },

  showNewPatientIndicator: {
    type: Boolean,
    optional: true
  },

  showLogsByDefault: {
    type: Boolean,
    optional: true
  },

  requiredFields: {
    type: Array,
    optional: true
  },
  'requiredFields.$': { type: String },

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

  smsAppointmentReminderTextMale: {
    type: String,
    optional: true
  },

  smsAppointmentReminderCancelationConfirmationText: {
    type: String,
    optional: true
  },

  smsDaysBefore: {
    type: Number,
    optional: true
  },

  queueing: {
    type: Boolean,
    optional: true
  },

  dismissing: {
    type: Boolean,
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
    type: Array,
    optional: true
  },
  'referrableFrom.$': { type: SimpleSchema.RegEx.Id },

  consentRequired: {
    type: Boolean,
    optional: true
  },

  requiredAgreements: {
    type: Array,
    allowedValues: agreements,
    optional: true
  },
  'requiredAgreements.$': { type: String },

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
  },

  showTitles: {
    type: Boolean,
    optional: true
  },

  showAppointmentNote: {
    type: Boolean,
    optional: true
  },

  keepNewAppointmentNote: {
    type: Boolean,
    optional: true
  },

  showGenderColor: {
    type: String,
    allowedValues: ['true', 'false', 'prefixOnly'],
    optional: true
  },

  allowAdmittingUnassignedToAnyone: {
    type: Boolean,
    optional: true
  },

  sameQuarterWarning: {
    type: Boolean,
    optional: true
  },

  scheduleableTagsScript: {
    type: String,
    optional: true
  }
})
