import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const mediaTypes = ['image/jpeg']
export const kinds = ['document', 'photo']

export const portalMedia = new SimpleSchema({
  mediaId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  patientId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  appointmentId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  kind: {
    type: String,
    allowedValues: kinds
  },

  cycle: {
    type: String,
    optional: true,
    index: 1
  },

  tagIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true,
    index: 1
  },

  rotation: {
    type: Number,
    optional: true,
    allowedValues: [0, 90, 180, 270]
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

  preview: {
    type: String
  },

  b64: {
    type: String
  },

  filename: {
    type: String
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

  // This field is TTL indexed
  // see collection.js for details
  publishedAt: {
    type: Date,
    autoValue: Auto.createdAt,
    optional: true,
    index: -1
  },

  publishedBy: {
    type: String
  }
})

export const media = new SimpleSchema({
  consumerId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  producerId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  patientId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  appointmentId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  docId: {
    type: SimpleSchema.RegEx.Id,
    optional: true,
    index: 1
  },

  kind: {
    type: String,
    allowedValues: kinds
  },

  cycle: {
    type: String,
    optional: true,
    index: 1
  },

  tagIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true,
    index: 1
  },

  rotation: {
    type: Number,
    optional: true,
    allowedValues: [0, 90, 180, 270]
  },

  // The publications generates a presigned GET url and attaches it as this field
  // but it's not saved in the db
  url: {
    type: String,
    optional: true
  },

  filename: {
    type: String
  },

  nonce: {
    type: String,
    optional: true
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

  uploadCompletedAt: {
    type: Date,
    optional: true
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
  },

  preview: {
    type: String
  }
})

export const mediaTags = new SimpleSchema({
  kind: {
    type: String,
    allowedValues: kinds
  },

  name: {
    type: String
  },

  namePlural: {
    type: String
  },

  order: {
    type: Number,
    optional: true
  },

  color: {
    type: String,
    optional: true
  },

  isConsent: {
    type: Boolean,
    optional: true
  },

  pinned: {
    type: Boolean,
    optional: true
  },

  isHiddenInFilter: {
    type: Boolean,
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
  }
})
