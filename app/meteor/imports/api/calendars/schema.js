import { SimpleSchema } from 'meteor/aldeed:simple-schema'

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
  }
})
