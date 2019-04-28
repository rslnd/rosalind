import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['future'],
    index: 1
  },

  patientId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  calendarId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  note: {
    type: String
  },

  createdAt: {
    type: Date,
    autoValue: Auto.createdAt,
    index: 1
  },

  createdBy: {
    type: SimpleSchema.RegEx.Id,
    autoValue: Auto.createdBy,
    optional: true
  },

  removed: {
    type: Boolean,
    optional: true
  },

  removedAt: {
    type: Date,
    optional: true
  }
})
