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

  allowUnassigned: {
    type: Boolean,
    defaultValue: true
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

  reportExpectedAsActual: {
    type: Boolean,
    optional: true
  },

  note: {
    type: String,
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

  consentRequired: {
    type: Boolean,
    optional: true
  },

  requiredAgreements: {
    type: [String],
    allowedValues: agreements,
    optional: true
  },

  roles: {
    type: [String],
    optional: true
  },

  history: {
    type: Boolean,
    optional: true
  }
})
