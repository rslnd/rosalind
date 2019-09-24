import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Auto from '../../util/schema/auto'

export const mediaTypes = ['image/jpeg']

export const media = new SimpleSchema({
  consumerId: {
    type: SimpleSchema.RegEx.Id,
    index: 1
  },

  producerId: {
    type: SimpleSchema.RegEx.Id
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

  tagIds: {
    type: [SimpleSchema.RegEx.Id],
    optional: true,
    index: 1
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
  tag: {
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
