import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const schema = new SimpleSchema({
  clientKey: {
    type: String,
    min: 200,
    index: 1
  },

  description: {
    type: String,
    optional: true
  },

  passwordlessGroupIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true
  },

  lastActionBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  lastActionAt: {
    type: Date,
    optional: true
  },

  version: {
    type: String,
    min: 3
  },

  settings: {
    type: Object,
    blackbox: true,
    optional: true
  },

  systemInfo: {
    type: Object,
    blackbox: true,
    optional: true
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt
  }
})
