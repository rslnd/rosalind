import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

const schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['appointmentReminder', 'inbound', 'intentToCancel', 'intentToCancelConfirmation']
  },

  channel: {
    type: String,
    allowedValues: ['SMS']
  },

  direction: {
    type: String,
    allowedValues: ['outbound', 'inbound']
  },

  status: {
    type: String,
    allowedValues: ['unread', 'read', 'answered', 'draft', 'final', 'scheduled', 'sent']
  },

  to: {
    type: String,
    optional: true
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
    optional: true
  },

  sentAt: {
    type: Date,
    optional: true
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
