import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const schema = new SimpleSchema({
  clientKey: {
    type: String
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
