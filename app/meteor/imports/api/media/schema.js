import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const mediaTypes = ['image/jpeg']

export const media = new SimpleSchema({
  consumerId: {
    type: SimpleSchema.RegEx.Id
  },

  producerId: {
    type: SimpleSchema.RegEx.Id
  },

  filename: {
    type: String
  },

  width: {
    type: Number
  },

  height: {
    type: Number
  },

  mediaType: {
    type: String,
    allowedValues: mediaTypes
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
    type: String
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
