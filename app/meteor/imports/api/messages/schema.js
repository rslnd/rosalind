import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

const schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['appointmentReminder', 'inbound', 'intentToCancel', 'intentToCancelConfirmation', 'custom', 'portalLogin']
  },

  channel: {
    type: String,
    allowedValues: ['SMS'],
    index: 1
  },

  direction: {
    type: String,
    allowedValues: ['outbound', 'inbound'],
    index: 1
  },

  status: {
    type: String,
    allowedValues: ['unread', 'read', 'answered', 'draft', 'final', 'scheduled', 'sent', 'failed'],
    index: 1
  },

  to: {
    type: String,
    optional: true,
    index: 1
  },

  from: {
    type: String,
    optional: true
  },

  text: {
    type: String,
    optional: true
  },

  scheduled: {
    type: Date,
    optional: true
  },

  patientId: {
    type: String,
    optional: true,
    index: 1
  },

  calendarId: {
    type: String,
    optional: true,
    index: 1
  },

  appointmentId: {
    type: String,
    optional: true,
    index: 1
  },

  userId: {
    type: String,
    optional: true,
    index: 1
  },

  payload: {
    type: Object,
    blackbox: true,
    optional: true
  },

  parentMessageId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    optional: true,
    index: -1
  },

  sentAt: {
    type: Date,
    optional: true,
    index: -1
  },

  retries: {
    type: Number,
    optional: true
  },

  invalidBefore: {
    type: Date,
    optional: true
  },

  invalidAfter: {
    type: Date,
    optional: true
  }
})

export default schema
