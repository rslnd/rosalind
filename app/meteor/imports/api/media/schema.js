import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

const mimeTypes = ['image/jpeg']

export const media = new SimpleSchema({
  consumerId: {
    type: SimpleSchema.RegEx.Id
  },

  width: {
    type: Number
  },

  height: {
    type: Number
  },

  mimeType: {
    type: String,
    allowedValues: mimeTypes
  },

  note: {
    type: String,
    optional: true
  },

  takenAt: {
    type: Date
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

  removedAt: {
    type: Date,
    optional: true
  },

  removedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  payload: {
    type: Object,
    optional: true,
    blackbox: true
  }
})
