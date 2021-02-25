import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const schema = new SimpleSchema({
  patientId: {
    type: SimpleSchema.RegEx.Id
  },

  appointmentId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  assigneeId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  templateId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  clientId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  mediaId: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  },

  payload: {
    type: Object,
    blackbox: true,
    optional: true
  },

  createdAt: {
    type: Date
  },

  createdBy: {
    type: SimpleSchema.RegEx.Id
  },

  printedAt: {
    type: Date
  },

  printedBy: {
    type: SimpleSchema.RegEx.Id
  },

  scannedAt: {
    type: Date,
    optional: true
  },

  scannedBy: {
    type: SimpleSchema.RegEx.Id,
    optional: true
  }
})
