import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { External, File } from '../../util/schema'

export const inboundCallsTopics = new SimpleSchema({
  label: {
    type: String
  },

  labelShort: {
    type: String,
    optional: true
  },

  slug: {
    type: String
  },

  // If true, contact form submissions via postContactForm are placed into this topic
  contactForm: {
    type: Boolean,
    optional: true
  },

  order: {
    type: Number,
    optional: true
  }
})

export const inboundCalls = new SimpleSchema({
  kind: {
    type: String,
    allowedValues: ['patient', 'other'],
    optional: true
  },

  firstName: {
    type: String,
    optional: true
  },

  lastName: {
    type: String,
    optional: true
  },

  telephone: {
    type: String,
    optional: true
  },

  note: {
    type: String
  },

  privatePatient: {
    type: Boolean,
    defaultValue: false
  },

  patientId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  topicId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  attachment: {
    type: File,
    optional: true
  },

  pinnedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  createdAt: {
    type: Date,
    optional: true,
    index: -1
  },

  createdBy: {
    type: String,
    optional: true
  },

  removed: {
    type: Boolean,
    optional: true,
    index: 1
  },

  payload: {
    type: Object,
    optional: true,
    blackbox: true
  },

  external: {
    type: External,
    optional: true
  }
})
