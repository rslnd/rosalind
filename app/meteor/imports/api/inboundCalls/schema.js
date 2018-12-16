import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const inboundCallsTopics = new SimpleSchema({
  label: {
    type: String
  },

  slug: {
    type: String
  },

  order: {
    type: Number,
    optional: true
  }
})

export const inboundCalls = new SimpleSchema({
  firstName: {
    type: String,
    optional: true
  },

  lastName: {
    type: String
  },

  telephone: {
    type: String,
    optional: true
  },

  note: {
    type: String,
    optional: true
  },

  privatePatient: {
    type: Boolean,
    defaultValue: false
  },

  topicId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  pinnedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    optional: true,
    index: -1
  },

  createdBy: {
    type: String,
    autoValue: Auto.createdBy,
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
  }
})
